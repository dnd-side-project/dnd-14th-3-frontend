import { apiClient } from "@/api/client";

export async function acceptApplicantApi(reservationId: number, applicantId: number) {
  const response = await apiClient.post(
    `/api/v1/reservations/${reservationId}/applicants/${applicantId}/accept`,
  );
  return response.data;
}
