import { apiClient } from "@/api/client";

export async function rejectApplicantApi(reservationId: number, applicantId: number) {
  const response = await apiClient.post(
    `/api/v1/reservations/${reservationId}/applicants/${applicantId}/reject`,
  );
  return response.data;
}
