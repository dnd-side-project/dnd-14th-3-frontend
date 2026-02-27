import { useEffect, useState } from "react";

import { MapPin } from "lucide-react";

import { BottomSheet } from "@/components/shared/bottom-sheet";
import { Button } from "@/components/shared/button";

type MatchingWaitSheet = {
  isOpen: boolean;
  isCancelling: boolean;
  nearbyWaitingCount: number | null;
  cancel: () => void;
};

type MatchFoundSheet = {
  isOpen: boolean;
  accept: () => void;
  rejectProposal: () => void;
  reject: () => void;
  cancelAndBackToIdle: () => void;
  close: () => void;
};

type MatchingPhasePanelsProps = {
  showMatchingPhase: boolean;
  showMatchSuccessPhase: boolean;
  isPeerRejectedFlow: boolean;
  matchingWaitSheet: MatchingWaitSheet;
  matchFoundSheet: MatchFoundSheet;
  onManualRejectRequested: () => void;
};

export default function MatchingPhasePanels({
  showMatchingPhase,
  showMatchSuccessPhase,
  isPeerRejectedFlow,
  matchingWaitSheet,
  matchFoundSheet,
  onManualRejectRequested,
}: MatchingPhasePanelsProps) {
  const [matchingHintIndex, setMatchingHintIndex] = useState(-1);
  const firstMatchingHint =
    matchingWaitSheet.nearbyWaitingCount != null
      ? `지금 ${matchingWaitSheet.nearbyWaitingCount}명의 사용자가 보고 있어요`
      : "지금 주변 사용자를 확인하고 있어요";
  const matchingHints = [
    firstMatchingHint,
    "가장 가까운 순서대로 연결 중이에요",
    "좋은 구도가 나올 분을 찾는 중이에요",
  ] as const;

  useEffect(() => {
    const resetTimerId = window.setTimeout(() => {
      setMatchingHintIndex(-1);
    }, 0);

    if (!matchingWaitSheet.isOpen) {
      return () => {
        window.clearTimeout(resetTimerId);
      };
    }

    let intervalId: number | null = null;
    const firstHintTimeoutId = window.setTimeout(() => {
      setMatchingHintIndex(0);
      intervalId = window.setInterval(() => {
        setMatchingHintIndex((prev) => (prev + 1) % matchingHints.length);
      }, 3000);
    }, 3000);

    return () => {
      window.clearTimeout(resetTimerId);
      window.clearTimeout(firstHintTimeoutId);
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [matchingHints.length, matchingWaitSheet.isOpen]);

  return (
    <>
      <BottomSheet
        isOpen={showMatchingPhase && matchingWaitSheet.isOpen}
        onClose={() => {}}
        showBackdrop
        backdropClick="none"
        draggable={false}
        dragToClose={false}
        initialSnap="full"
        renderContent={
          <div className="space-y-1 pt-4">
            <p className="text-body-2 text-gray-500">500m 이내</p>
            <p className="mb-3 text-heading-2 font-bold">오늘의 사진 메이트를 찾고 있어요</p>
            <p className="text-body-1 text-gray-500">
              {matchingHintIndex >= 0 ? matchingHints[matchingHintIndex] : ""}
            </p>
          </div>
        }
        footer={
          <Button.Secondary
            fullWidth
            disabled={matchingWaitSheet.isCancelling}
            onClick={matchingWaitSheet.cancel}
          >
            {matchingWaitSheet.isCancelling ? "요청 취소 중..." : "요청 취소"}
          </Button.Secondary>
        }
      />

      <BottomSheet
        isOpen={showMatchSuccessPhase && matchFoundSheet.isOpen && !isPeerRejectedFlow}
        onClose={matchFoundSheet.close}
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
          <div className="text-body-2 text-gray-500">
            매칭 후 15분 이내에 이동을 시작해주세요.
            <br />
            늦을 경우 매칭이 자동 취소될 수 있어요.
          </div>
        }
        footer={
          <div className="flex items-center gap-3">
            <Button.Secondary
              fullWidth
              onClick={() => {
                matchFoundSheet.close();
                onManualRejectRequested();
              }}
            >
              매칭 거절
            </Button.Secondary>
            <Button.Primary fullWidth onClick={matchFoundSheet.accept}>
              매칭 수락
            </Button.Primary>
          </div>
        }
      />
    </>
  );
}
