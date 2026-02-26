import type { ReservationCommentDto } from "@/types/companion-reservation";

import { formatRelativeTime } from "@/lib/shared/format";

import { LoadingIndicator } from "@/components/shared/loading";

import ProfileAvatar from "./ProfileAvatar";

interface DetailCommentSectionProps {
  commentCount: number;
  commentsLoading: boolean;
  comments: ReservationCommentDto[];
  currentUserId: number | null;
  onEditComment?: (comment: ReservationCommentDto) => void;
  onDeleteComment?: (comment: ReservationCommentDto) => void;
  onReportComment?: (comment: ReservationCommentDto) => void;
}

export default function DetailCommentSection({
  commentCount,
  commentsLoading,
  comments,
  currentUserId,
  onEditComment,
  onDeleteComment,
  onReportComment,
}: DetailCommentSectionProps) {
  return (
    <section className="flex flex-col gap-5 px-5">
      <h2 className="text-body-1 font-medium text-gray-900">댓글 {commentCount}개</h2>
      {commentsLoading ? (
        <div className="flex justify-center py-4">
          <LoadingIndicator />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-body-2 text-gray-400">아직 댓글이 없어요.</p>
      ) : (
        comments.map((comment) => {
          const isAuthor = currentUserId !== null && comment.authorId === currentUserId;
          return (
            <div key={comment.commentId} className="group border-b border-gray-100 pb-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <ProfileAvatar
                    imageUrl={comment.authorProfileImageUrl}
                    nickname={comment.authorNickname}
                  />
                  <span className="text-label-1 font-bold text-gray-900">
                    {comment.authorNickname}
                  </span>
                </div>
                {isAuthor ? (
                  <div className="flex shrink-0 items-center gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      className="text-label-2 text-gray-500 hover:text-gray-700"
                      onClick={() => onEditComment?.(comment)}
                      aria-label="댓글 수정"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className="text-label-2 text-gray-500 hover:text-gray-700"
                      onClick={() => onDeleteComment?.(comment)}
                      aria-label="댓글 삭제"
                    >
                      삭제
                    </button>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      className="text-label-2 text-gray-500 hover:text-gray-700"
                      onClick={() => onReportComment?.(comment)}
                      aria-label="댓글 신고"
                    >
                      신고
                    </button>
                  </div>
                )}
              </div>
              <p className="text-body-2 text-gray-600 whitespace-pre-wrap">{comment.content}</p>
              <p className="mt-1 text-caption-1 text-gray-400">
                {formatRelativeTime(comment.createdAt)}
              </p>
            </div>
          );
        })
      )}
    </section>
  );
}
