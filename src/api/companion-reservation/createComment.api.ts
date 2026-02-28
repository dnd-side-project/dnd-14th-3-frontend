import {
  type ReservationCommentCreateRequest,
  reservationCommentCreateRequestSchema,
} from "@/types/companion-reservation";

import { apiClient } from "@/api/client";

export async function createCommentApi(
  reservationId: number,
  payload: ReservationCommentCreateRequest
) {
  const parsed = reservationCommentCreateRequestSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error("댓글 내용이 올바르지 않습니다.");
  }

  const response = await apiClient.post(
    `/api/v1/reservations/${reservationId}/comments`,
    parsed.data
  );

  return response.data;
}
