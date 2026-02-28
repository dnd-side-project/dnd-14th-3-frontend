import { apiClient } from "@/api/client";

export async function cancelReservationApi(reservationId: number) {
  const response = await apiClient.delete(`/api/v1/reservations/${reservationId}`);
  return response.data;
}
