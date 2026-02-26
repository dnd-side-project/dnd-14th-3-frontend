import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { getOwnerMeta, getPhotoStyleLabels } from "@/lib/companion-reservation/companionDetail";

import { getUserIdFromToken } from "@/services/auth/getUserIdFromToken.service";

import { useCompanionDetailMutations } from "@/hooks/companion-reservation/useCompanionDetailMutations";

import { useComments, useReservationDetail } from "@/queries/companion-reservation";

import {
  DetailActionSection,
  DetailCommentSection,
  DetailInfoSection,
} from "@/components/companion-reservation";
import { Button } from "@/components/shared/button";
import { LoadingIndicator } from "@/components/shared/loading";
import { Popup } from "@/components/shared/popup";

export default function CompanionDetailPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const id = Number(reservationId);
  const [commentInput, setCommentInput] = useState("");
  const [isApplyPopupOpen, setIsApplyPopupOpen] = useState(false);

  const tokenUserId = getUserIdFromToken();
  const currentUserId = tokenUserId ? Number(tokenUserId) : null;

  const { data: detail, isLoading, isError, refetch } = useReservationDetail(id);
  const { data: commentsData, isLoading: commentsLoading } = useComments(id, { limit: 20 });

  const comments = useMemo(
    () =>
      (commentsData?.pages.flatMap((page) => page.content) ?? []).filter(
        (comment) => !comment.isDeleted
      ),
    [commentsData]
  );

  const photoStyleLabels = useMemo(
    () => getPhotoStyleLabels(detail?.photoStyleSnapshot),
    [detail?.photoStyleSnapshot]
  );

  const ownerMeta = useMemo(
    () => getOwnerMeta(detail?.ownerAgeGroup, detail?.ownerGender),
    [detail?.ownerAgeGroup, detail?.ownerGender]
  );

  const isOwner =
    currentUserId !== null && Number.isFinite(currentUserId)
      ? currentUserId === detail?.ownerId
      : false;

  const { applyMutation, createCommentMutation, cancelReservationMutation } =
    useCompanionDetailMutations({
      id,
      onApplySuccess: () => setIsApplyPopupOpen(false),
      onCommentSuccess: () => setCommentInput(""),
    });

  const trimmedComment = commentInput.trim();
  const isCommentSubmitDisabled = createCommentMutation.isPending || trimmedComment.length === 0;

  const handleCommentInputChange = (value: string) => {
    setCommentInput(value);
  };

  const handleCommentSubmit = () => {
    if (isCommentSubmitDisabled) return;
    createCommentMutation.mutate(trimmedComment);
  };

  const openApplyPopup = () => {
    setIsApplyPopupOpen(true);
  };

  const closeApplyPopup = () => {
    setIsApplyPopupOpen(false);
  };

  const handleApplyConfirm = () => {
    if (applyMutation.isPending) return;
    applyMutation.mutate();
  };

  const handleCancelReservation = () => {
    if (cancelReservationMutation.isPending) return;
    cancelReservationMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-8 text-center">
        <p className="text-body-1 font-medium text-gray-700">동행 예약 정보를 불러오지 못했어요.</p>
        <Button.Secondary onClick={() => refetch()} fullWidth className="max-w-64">
          다시 시도
        </Button.Secondary>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col pb-[calc(140px+env(safe-area-inset-bottom))]">
      <section className="flex flex-col gap-1 px-5 pb-6 pt-5">
        <h1 className="text-heading-2 font-bold text-gray-900">{detail.title}</h1>
        <p className="text-label-1 text-gray-500">
          조회수 {detail.viewCount} · 동행 요청 {detail.applicantCount}건 · 댓글{" "}
          {detail.commentCount}
        </p>
      </section>

      <DetailInfoSection
        detail={detail}
        ownerMeta={ownerMeta}
        photoStyleLabels={photoStyleLabels}
      />

      <DetailCommentSection
        commentCount={detail.commentCount}
        commentsLoading={commentsLoading}
        comments={comments}
        currentUserId={currentUserId}
      />

      <DetailActionSection
        commentInput={commentInput}
        isCommentSubmitDisabled={isCommentSubmitDisabled}
        isOwner={isOwner}
        status={detail.status}
        isApplyPending={applyMutation.isPending}
        isCancelPending={cancelReservationMutation.isPending}
        onCommentInputChange={handleCommentInputChange}
        onCommentSubmit={handleCommentSubmit}
        onOpenApplyPopup={openApplyPopup}
        onCancelReservation={handleCancelReservation}
      />

      <Popup
        isOpen={isApplyPopupOpen}
        title={`‘${detail.ownerNickname}’ 님에게\n동행을 요청하시겠습니까?`}
        content={"게시자의 수락이 필요하며,\n수락 즉시 바로 1:1 동행이 매칭됩니다."}
        confirmMessage={applyMutation.isPending ? "요청 중..." : "동행 요청하기"}
        cancelMessage="잠시 멈출래요"
        onClose={() => {
          if (!applyMutation.isPending) {
            closeApplyPopup();
          }
        }}
        onConfirm={handleApplyConfirm}
        onCancel={closeApplyPopup}
      />
    </div>
  );
}
