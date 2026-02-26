import { getStatusMessage } from "@/lib/companion-reservation/companionDetail";

import { Button } from "@/components/shared/button";

interface DetailActionSectionProps {
  commentInput: string;
  isCommentSubmitDisabled: boolean;
  isOwner: boolean;
  status: string;
  isApplyPending: boolean;
  isCancelPending: boolean;
  onCommentInputChange: (value: string) => void;
  onCommentSubmit: () => void;
  onOpenApplyPopup: () => void;
  onCancelReservation: () => void;
}

export default function DetailActionSection({
  commentInput,
  isCommentSubmitDisabled,
  isOwner,
  status,
  isApplyPending,
  isCancelPending,
  onCommentInputChange,
  onCommentSubmit,
  onOpenApplyPopup,
  onCancelReservation,
}: DetailActionSectionProps) {
  return (
    <section className="fixed bottom-0 left-1/2 z-30 w-full max-w-150 -translate-x-1/2 bg-white px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-[0px_-4px_12px_0px_rgba(0,0,0,0.04)]">
      <div className="mb-3 flex h-12.5 items-center gap-2 rounded-[10px] border border-gray-300 px-3">
        <input
          value={commentInput}
          onChange={(event) => onCommentInputChange(event.target.value)}
          placeholder="댓글을 작성해보세요."
          className="min-w-0 flex-1 text-label-1 text-gray-700 placeholder:text-gray-500 focus:outline-none"
        />
        <button
          type="button"
          disabled={isCommentSubmitDisabled}
          onClick={onCommentSubmit}
          className="text-label-1 text-mint-500 disabled:text-gray-400"
        >
          완료
        </button>
      </div>

      {status === "RECRUITING" ? (
        isOwner ? (
          <Button.Error
            fullWidth
            disabled={isCancelPending}
            onClick={onCancelReservation}
            className="h-13 rounded-xl"
          >
            {isCancelPending ? "취소 중..." : "모집 취소하기"}
          </Button.Error>
        ) : (
          <Button.Primary
            fullWidth
            disabled={isApplyPending}
            onClick={onOpenApplyPopup}
            className="h-13 rounded-xl"
          >
            {isApplyPending ? "요청 중..." : "동행 요청하기"}
          </Button.Primary>
        )
      ) : (
        <div className="rounded-xl bg-gray-100 py-3 text-center text-body-2 text-gray-500">
          {getStatusMessage(status)}
        </div>
      )}
    </section>
  );
}
