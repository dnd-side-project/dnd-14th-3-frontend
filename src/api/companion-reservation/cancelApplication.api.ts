import { apiClient } from "@/api/client";

export async function cancelApplicationApi(reservationId: number) {
  const response = await apiClient.delete(`/api/v1/reservations/${reservationId}/apply`);
  return response.data;
}
