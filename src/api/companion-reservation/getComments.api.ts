import { pageResponseReservationCommentDtoSchema } from "@/types/companion-reservation";

import { apiClient } from "@/api/client";

export interface GetCommentsParams {
  cursor?: number;
  limit?: number;
}

export async function getCommentsApi(reservationId: number, params: GetCommentsParams = {}) {
  const response = await apiClient.get(`/api/v1/reservations/${reservationId}/comments`, {
    params,
  });

  const parsed = pageResponseReservationCommentDtoSchema.safeParse(response.data.data);

  if (!parsed.success) {
    throw new Error("Invalid comments response");
  }

  return parsed.data;
}
