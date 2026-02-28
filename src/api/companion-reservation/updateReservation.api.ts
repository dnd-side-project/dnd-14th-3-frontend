import type { ReservationUpdateRequest } from "@/types/companion-reservation";

import { apiClient } from "@/api/client";

export async function updateReservationApi(reservationId: number, body: ReservationUpdateRequest) {
  const response = await apiClient.patch(`/api/v1/reservations/${reservationId}`, body);
  return response.data;
}
