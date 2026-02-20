import { Fragment, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/shared/button";

export interface PopupProps {
  isOpen: boolean;
  title: string;
  content: string;
  confirmMessage?: string;
  cancelMessage?: string;
  showConfirm?: boolean;
  showCancel?: boolean;
  closeOnBackdrop?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function Popup({
  isOpen,
  title,
  content,
  confirmMessage = "확인",
  cancelMessage = "취소",
  showConfirm = true,
  showCancel = true,
  closeOnBackdrop = true,
  onClose,
  onConfirm,
  onCancel,
}: PopupProps) {
  const portalTarget =
    typeof document !== "undefined"
      ? (document.getElementsByTagName("main")[0]?.parentElement ?? document.body)
      : null;
  const [layoutRect, setLayoutRect] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || !portalTarget) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const updateLayoutRect = () => {
      const rect = portalTarget.getBoundingClientRect?.();
      if (!rect) return;
      setLayoutRect({ left: rect.left, width: rect.width });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };

    updateLayoutRect();
    window.addEventListener("resize", updateLayoutRect);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("resize", updateLayoutRect);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, portalTarget, onClose]);

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const shouldShowActions = useMemo(() => showConfirm || showCancel, [showConfirm, showCancel]);

  if (!isOpen || !portalTarget) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={
        layoutRect != null
          ? { left: `${layoutRect.left}px`, width: `${layoutRect.width}px` }
          : undefined
      }
    >
      <div
        role="presentation"
        aria-hidden="true"
        className="absolute inset-0 bg-gray-900/50"
        onClick={() => {
          if (closeOnBackdrop) onClose?.();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shared-popup-title"
        className="relative z-10 w-full max-w-[460px] rounded-xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
      >
        <h2 id="shared-popup-title" className="text-center text-heading-2 font-bold text-gray-900">
          {title}
        </h2>
        <p className="mt-1 whitespace-pre-line text-center text-body-1 text-gray-500">
          {content.split("\n").map((line, index) => (
            <Fragment key={`${line}-${index}`}>
              {index > 0 ? <br /> : null}
              {line}
            </Fragment>
          ))}
        </p>

        {shouldShowActions && (
          <div className="mt-5 flex flex-col gap-2">
            {showConfirm && (
              <Button.Primary fullWidth onClick={handleConfirm}>
                {confirmMessage}
              </Button.Primary>
            )}
            {showCancel && (
              <Button.Secondary
                fullWidth
                onClick={handleCancel}
              >
                {cancelMessage}
              </Button.Secondary>
            )}
          </div>
        )}
      </div>
    </div>,
    portalTarget
  );
}
