import { Camera, ChevronUp, MapPin, X } from "lucide-react";

import { BottomSheet } from "@/components/shared/bottom-sheet";
import { Button } from "@/components/shared/button";
import { Popup } from "@/components/shared/popup";

type AcceptedMatchDetailSheet = {
  isOpen: boolean;
  hasMatchSession: boolean;
  isMoving: boolean;
  proposalRejectedSignal: number;
  partnerProfileText: string;
  partnerExpectedDurationLabel: string;
  partnerRequestMessage: string;
  startMoving: () => void;
  close: () => void;
};

type MatchExpiredModal = {
  isOpen: boolean;
  expiresAt: string | null;
  retry: () => void;
  pause: () => void;
  close: () => void;
};

type MatchRetryLimitModal = {
  isOpen: boolean;
  reserve: () => void;
  nextTime: () => void;
  close: () => void;
};

type SessionPhasePanelsProps = {
  showAcceptedPhase: boolean;
  showMovingPhase: boolean;
  showFailedPhase: boolean;
  isPeerRejectedFlow: boolean;
  acceptedMatchDetailSheet: AcceptedMatchDetailSheet;
  matchExpiredModal: MatchExpiredModal;
  matchRetryLimitModal: MatchRetryLimitModal;
  movingSheetSnapState: "collapsed" | "full";
  onMovingSheetSnapChange: (snap: "collapsed" | "full") => void;
  onManualRejectRequested: () => void;
};

export default function SessionPhasePanels({
  showAcceptedPhase,
  showMovingPhase,
  showFailedPhase,
  isPeerRejectedFlow,
  acceptedMatchDetailSheet,
  matchExpiredModal,
  matchRetryLimitModal,
  movingSheetSnapState,
  onMovingSheetSnapChange,
  onManualRejectRequested,
}: SessionPhasePanelsProps) {
  return (
    <>
      <Popup
        isOpen={
          acceptedMatchDetailSheet.isOpen &&
          !acceptedMatchDetailSheet.hasMatchSession &&
          !isPeerRejectedFlow
        }
        title="수락을 기다리는 중이에요"
        content={`사진 메이트가 수락하면\n상세 정보를 볼 수 있어요`}
        showConfirm={false}
        closeOnBackdrop={false}
        cancelMessage="매칭 중단하기"
        onCancel={() => {
          onManualRejectRequested();
          acceptedMatchDetailSheet.close();
        }}
        onClose={acceptedMatchDetailSheet.close}
      />

      <BottomSheet
        isOpen={showAcceptedPhase && acceptedMatchDetailSheet.hasMatchSession && !isPeerRejectedFlow}
        onClose={acceptedMatchDetailSheet.close}
        showBackdrop
        backdropClick="none"
        draggable={false}
        dragToClose={false}
        initialSnap="full"
        header={() => (
          <div className="flex items-center gap-2 px-4 pb-4 pt-4">
            <div className="flex flex-row items-center gap-2">
              <MapPin />
              <div className="text-heading-2 font-bold text-gray-900">사진 메이트를 찾았어요</div>
            </div>
          </div>
        )}
        renderContent={
          <div className="h-[64vh] space-y-2">
            <div>
              <div className="flex flex-row justify-between py-2">
                <div className="text-body-1 font-bold">프로필</div>
              </div>
              <div className="text-body-2 text-gray-500">
                <div>{acceptedMatchDetailSheet.partnerProfileText}</div>
              </div>
            </div>
            <div>
              <div className="py-2 text-body-1 font-bold">촬영 예상 소요 시간</div>
              <span className="inline-flex items-center gap-1 rounded-md border border-mint-500 px-2 py-1 text-caption-1">
                <Camera className="text-mint-500" size={16} />
                <p>{acceptedMatchDetailSheet.partnerExpectedDurationLabel}</p>
              </span>
            </div>
            <div>
              <div className="py-2 text-body-1 font-bold">요청 메세지</div>
              <div className="min-h-[122px] rounded-md border border-mint-500 p-3">
                {acceptedMatchDetailSheet.partnerRequestMessage}
              </div>
            </div>
          </div>
        }
        footer={
          <Button.Primary fullWidth onClick={acceptedMatchDetailSheet.startMoving}>
            이동하기
          </Button.Primary>
        }
      />

      <BottomSheet
        isOpen={showMovingPhase && acceptedMatchDetailSheet.hasMatchSession && !isPeerRejectedFlow}
        onClose={acceptedMatchDetailSheet.close}
        showBackdrop={false}
        backdropClick="none"
        draggable
        dragToClose={false}
        initialSnap="collapsed"
        onSnapChange={onMovingSheetSnapChange}
        header={(actions) => (
          <div className="flex items-center justify-between gap-2 px-4 pb-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="flex flex-row items-center gap-2">
                <MapPin />
                <div className="text-heading-2 font-bold text-gray-900">이동 중</div>
              </div>
            </div>
            <button
              type="button"
              aria-label={
                movingSheetSnapState === "collapsed" ? "바텀시트 펼치기" : "바텀시트 접기"
              }
              className="inline-flex size-7 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => {
                if (movingSheetSnapState === "collapsed") {
                  actions.expand();
                  return;
                }
                actions.collapse();
              }}
            >
              {movingSheetSnapState === "collapsed" ? (
                <ChevronUp className="size-5" />
              ) : (
                <X className="size-5" />
              )}
            </button>
          </div>
        )}
        renderContent={
          <div className="text-body-2 text-gray-500">
            도착 완료 시 버튼을 누르면 상대방에게 알림이 가요.
          </div>
        }
        footer={
          <div className="flex items-center gap-4">
            <Button.Secondary fullWidth>길찾기</Button.Secondary>
            <Button.Primary fullWidth>도착 완료</Button.Primary>
          </div>
        }
      />

      <Popup
        isOpen={showFailedPhase && matchExpiredModal.isOpen}
        title="아직 연결되지 않았어요"
        content={"지금 근처에 수락 가능한 사용자가 없어요.\n다시 시도해볼까요?"}
        confirmMessage="재시도"
        cancelMessage="잠시 멈출게요"
        onClose={matchExpiredModal.close}
        onConfirm={matchExpiredModal.retry}
        onCancel={matchExpiredModal.pause}
      />

      <Popup
        isOpen={showFailedPhase && matchRetryLimitModal.isOpen}
        title="지금은 매칭이 어려운 시간이에요"
        content={"현재 매칭을 취소하고\n다른 메이트를 찾을 수 있어요"}
        confirmMessage="사전 예약하기"
        cancelMessage="다음에 다시 찾기"
        onClose={matchRetryLimitModal.close}
        onConfirm={matchRetryLimitModal.reserve}
        onCancel={matchRetryLimitModal.nextTime}
      />
    </>
  );
}
