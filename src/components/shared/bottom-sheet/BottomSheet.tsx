import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import {
  AnimatePresence,
  motion,
  type PanInfo,
  Transition,
  useAnimate,
  useDragControls,
} from "framer-motion";

/* =====================
 * Types
 * ===================== */

export type BottomSheetSnapState = "collapsed" | "full";

/** Header render prop에 넘기는 접기/펼치기/닫기 액션 */
export interface BottomSheetHeaderActions {
  /** 시트 닫기 */
  close: () => void;
  /** 맨 아래 스냅으로 접기 */
  collapse: () => void;
  /** 완전히 펼치기 */
  expand: () => void;
}


export interface BottomSheetProps {
  /** 바텀시트 노출 여부 */
  isOpen: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 시트 본문. bottomSheet 액션(close/collapse/expand)을 인자로 받아 ReactNode 반환 */
  renderContent: ((actions: BottomSheetHeaderActions) => ReactNode) | ReactNode;
  /** 커스텀 헤더. 접기/펼치기/닫기 액션을 받아 렌더링 (드래그 영역에 포함됨) */
  header?: ((actions: BottomSheetHeaderActions) => ReactNode) | ReactNode;
  /** 열릴 때 초기 스냅. 'collapsed'=접힌(헤더만), 'full'=펼침(본문). 기본 'full' */
  initialSnap?: BottomSheetSnapState;
  /** dim(배경) 클릭 시 동작. 미입력 시 'close'. */
  backdropClick?: "none" | "collapse" | "close";
  /** dim(배경) 표시 여부. 기본 `true`. */
  showBackdrop?: boolean;
  /**
   * 드래그로 접기/펼치기 허용 여부. 기본 `true`.
   * false면 접힘 없이 항상 펼친 상태만
   */
  draggable?: boolean;
  /**
   * 드래그로 닫기 허용. 기본 `false`.
   * false면 드래그로 닫히지 않음.
   */
  dragToClose?: boolean;
  /** 스냅 변경 시 콜백 (접힘/펼침) */
  onSnapChange?: (state: BottomSheetSnapState) => void;
  /** 하단 고정 영역 (Figma 공통: 도착 완료, 매칭 수락, 요청하기 등 CTA 버튼) */
  footer?: ((actions: BottomSheetHeaderActions) => ReactNode) | ReactNode;
  /** 추가 클래스명 */
  className?: string;
}

/* =====================
 * Helpers
 * ===================== */

const BACKDROP = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

const SNAP_ANIMATION: Transition = { type: "tween", duration: 0.3, ease: "easeOut" as const };
/** 드래그 종료 시 스냅/닫기 판단용 임계값 */
const DRAG = {
  /** 이보다 작은 이동/속도면 현재 스냅 유지 */
  hold: { offset: 60, velocity: 200 },
  /** 이보다 크면 스냅 전환 (또는 닫기) */
  snap: { offset: 300, velocity: 500 },
  /** 접힌 상태에서 이 속도 이상이면 닫기 */
  closeVelocity: 500,
} as const;

/**
 * 드래그 종료 시 스냅(접기/펼치기) 또는 닫기 결과를 반환.
 * - hold: 이동/속도가 작으면 현재 스냅 유지
 * - close: dragToClose + draggable + 접힌 상태에서만 아래로 드래그 + 속도 충분 → 닫기
 * - 그 외: 방향에 따라 collapsed / full 스냅 전환
 */
function getDragEndResult(
  offsetY: number,
  velocityY: number,
  currentSnap: BottomSheetSnapState,
  dragToClose: boolean,
  draggable: boolean
): { close: boolean; snapState: BottomSheetSnapState } {
  const absOffset = Math.abs(offsetY);
  const absVel = Math.abs(velocityY);
  const isDraggingDown = offsetY > 0;

  // 움직임이 작으면 스냅/닫기 판단 없이 현재 상태 유지
  if (absOffset <= DRAG.hold.offset && absVel <= DRAG.hold.velocity) {
    return { close: false, snapState: currentSnap };
  }

  // 스냅 전환 또는 닫기를 고려할 만한 구간인지
  const isSnapOrCloseRange =
    absOffset > DRAG.snap.offset || absVel > DRAG.snap.velocity;
  // 닫기 허용: dragToClose + draggable + 접힌 상태에서만 + 아래 방향 + 속도 임계값
  const canClose =
    dragToClose &&
    draggable &&
    currentSnap === "collapsed" &&
    isDraggingDown &&
    absVel > DRAG.closeVelocity;
  if (isSnapOrCloseRange && canClose) {
    return { close: true, snapState: currentSnap };
  }

  // 접기/펼치기 스냅만 전환 (닫지 않음)
  const nextState: BottomSheetSnapState =
    draggable && isDraggingDown ? "collapsed" : "full";
  return { close: false, snapState: nextState };
}

/* =====================
 * BottomSheet Component
 * ===================== */
const DEFAULT_VH = 600;

/** 접힌/펼침에 대응하는 높이 [접힌, 펼침] */
const HEIGHT_INDEX: Record<BottomSheetSnapState, 0 | 1> = {
  collapsed: 0,
  full: 1,
};

export default function BottomSheet({
  isOpen,
  onClose,
  renderContent,
  initialSnap = "full",
  backdropClick,
  showBackdrop = true,
  draggable = true,
  dragToClose = false,
  onSnapChange,
  footer,
  header,
  className = "",
}: BottomSheetProps) {
  const effectiveInitialSnap: BottomSheetSnapState =
    draggable ? initialSnap : "full";
  const [snapState, setSnapState] = useState<BottomSheetSnapState>(effectiveInitialSnap);
  const [vh, setVh] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : DEFAULT_VH
  );
  const dragControls = useDragControls();
  const [panelScope, panelAnimate] = useAnimate<HTMLDivElement>();
  const headerAreaRef = useRef<HTMLDivElement>(null);
  const contentInnerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [measuredHeaderHeightPx, setMeasuredHeaderHeightPx] = useState(72);
  /** 펼침 높이. 초기를 헤더 수준(72)으로 두어 열릴 때 600px→실측으로 줄어드는 움직임 방지 */
  const [measuredContentHeightPx, setMeasuredContentHeightPx] = useState(72);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("resize", onResize);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const el = headerAreaRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height;
      if (typeof height === "number" && height > 0)
        setMeasuredHeaderHeightPx(height);
    });
    ro.observe(el);
    setMeasuredHeaderHeightPx(el.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, [isOpen]);

  /** 펼침 시: 헤더 + 본문(내부 높이) + 푸터 합으로 전체 높이 측정 → 콘텐츠 증감 시 애니메이션 가능 */
  useLayoutEffect(() => {
    if (!isOpen || snapState !== "full") return;
    const headerEl = headerAreaRef.current;
    const contentEl = contentInnerRef.current;
    const footerEl = footerRef.current;
    if (!headerEl || !contentEl) return;

    const updateFullHeight = () => {
      const headerH = headerEl.getBoundingClientRect().height;
      const contentH = contentEl.getBoundingClientRect().height;
      const footerH = footerEl?.getBoundingClientRect().height ?? 0;
      const total = headerH + contentH + footerH;
      if (total > 0) setMeasuredContentHeightPx(total);
    };

    const ro = new ResizeObserver(updateFullHeight);
    ro.observe(contentEl);
    if (footerEl) ro.observe(footerEl);
    updateFullHeight();
    return () => ro.disconnect();
  }, [isOpen, snapState]);

  const snapHeightsPx = useMemo(() => [measuredHeaderHeightPx, measuredContentHeightPx], [measuredHeaderHeightPx, measuredContentHeightPx]);
  const maxHeightPx = Math.max(...snapHeightsPx);
  const minHeightPx = Math.min(...snapHeightsPx);
  const heightIndex = HEIGHT_INDEX[snapState];
  const currentY = maxHeightPx - snapHeightsPx[heightIndex];
  /** draggable 시: 접힌↔펼침 드래그 범위. false 시: 아래로만 드래그(닫기만) */
  const dragBottom = draggable ? maxHeightPx - minHeightPx : 0;

  /** 펼침 시 컨테이너 높이. 최소 헤더 높이 이상으로 유지 */
  const panelHeightPx =
    snapState === "full"
      ? Math.max(measuredHeaderHeightPx, Math.min(measuredContentHeightPx, vh))
      : maxHeightPx;
  const panelHeightStyle =
    snapState === "full" ? { maxHeight: vh } : {};

  const headerActions = useMemo<BottomSheetHeaderActions>(
    () => ({
      close: onClose,
      collapse: draggable ? () => setSnapState("collapsed") : () => { },
      expand: () => setSnapState("full"),
    }),
    [onClose, draggable]
  );

  useEffect(() => {
    onSnapChange?.(snapState);
  }, [snapState, onSnapChange]);


  const handleBackdropClick = useCallback(() => {
    const behavior = backdropClick ?? "close";
    if (behavior === "none") return;
    if (behavior === "close") {
      onClose();
      return;
    }
    if (behavior === "collapse" && draggable) {
      setSnapState("collapsed");
      panelAnimate(panelScope.current, { y: maxHeightPx - snapHeightsPx[0] }, SNAP_ANIMATION);
    }
  }, [backdropClick, onClose, draggable, maxHeightPx, snapHeightsPx, panelScope, panelAnimate]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const result = getDragEndResult(
        info.offset.y,
        info.velocity.y,
        snapState,
        dragToClose,
        draggable
      );
      if (result.close) {
        onClose();
        return;
      }
      const targetY = maxHeightPx - snapHeightsPx[HEIGHT_INDEX[result.snapState]];
      setSnapState(result.snapState);
      panelAnimate(panelScope.current, { y: targetY }, SNAP_ANIMATION);
    },
    [snapState, dragToClose, draggable, onClose, maxHeightPx, snapHeightsPx, panelScope, panelAnimate]
  );

  const portalTarget =
    typeof document !== "undefined"
      ? document.getElementsByTagName("main")[0]?.parentElement ?? document.body
      : null;

  const [layoutWidth, setLayoutWidth] = useState<number | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !portalTarget) return;
    const updateWidth = () => {
      const w = portalTarget.getBoundingClientRect?.().width;
      if (typeof w === "number") setLayoutWidth(w);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [portalTarget]);

  const portalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {showBackdrop && (
            <motion.div
              role="presentation"
              aria-hidden
              className="fixed w-full top-0 bottom-0 z-50 bg-gray-900/50"
              style={{
                maxWidth: layoutWidth != null ? `${layoutWidth}px` : undefined,
                pointerEvents: snapState === "collapsed" ? "none" : "auto",
              }}
              initial={BACKDROP.initial}
              animate={{ opacity: snapState === "collapsed" ? 0 : 1 }}
              exit={BACKDROP.exit}
              transition={BACKDROP.transition}
              onClick={handleBackdropClick}
            />
          )}
          <motion.div
            ref={panelScope}
            role="dialog"
            aria-modal="true"
            aria-label="바텀 시트"
            className={`fixed w-full bottom-0 z-50 flex flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] ${className}`}
            style={{
              ...panelHeightStyle,
              ...(layoutWidth != null ? { maxWidth: `${layoutWidth}px` } : {}),
              willChange: "transform"
            }}
            initial={{ y: vh, height: panelHeightPx }}
            animate={{ y: currentY, height: panelHeightPx }}
            exit={{
              y: vh,
              // collapse 상태에서 닫을 땐 헤더 높이만 쓰면, 아래로 내려가며 콘텐츠가 드러나는 'expand' 같은 연출 방지
              height: snapState === "collapsed" ? measuredHeaderHeightPx : panelHeightPx,
            }}
            transition={SNAP_ANIMATION}
            onClick={(e) => e.stopPropagation()}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: dragBottom }}
            dragElastic={0}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
          >
            {/* Handle + Header: 이 영역 높이 = 접힌 높이, 본문 높이 = 펼친 높이 */}
            <div
              ref={headerAreaRef}
              className={"flex shrink-0 cursor-grab touch-none flex-col " + (draggable ? "active:cursor-grabbing" : "")}
              onPointerDown={(e) => dragControls.start(e)}
            >
              {draggable && <div className="flex justify-center pt-3 pb-1">
                <span className="h-1 w-10 rounded-lg bg-gray-200" aria-hidden />
              </div>}
              {!!header
                && typeof header === "function"
                ? header(headerActions)
                : header
              }
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
              onTouchMove={(e) => {
                if (e.currentTarget.scrollTop === 0) {
                  e.stopPropagation();
                }
              }}
              style={{ WebkitOverflowScrolling: "touch" }}>
              <div ref={contentInnerRef} className="h-fit px-4 pb-6 pt-2">
                {typeof renderContent === "function" ? renderContent(headerActions) : renderContent}
              </div>
            </div>

            {!!footer && (
              <div ref={footerRef} className="shrink-0 px-4 py-4">
                {typeof footer === "function" ? footer(headerActions) : footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!portalTarget) return null;
  return createPortal(portalContent, portalTarget);
}
