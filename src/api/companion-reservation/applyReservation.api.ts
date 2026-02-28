import { apiClient } from "@/api/client";

export async function applyReservationApi(reservationId: number) {
  const response = await apiClient.post(`/api/v1/reservations/${reservationId}/apply`);
  return response.data;
}
