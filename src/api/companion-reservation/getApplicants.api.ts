import { applicantListResponseDtoSchema } from "@/types/companion-reservation";

import { apiClient } from "@/api/client";

export async function getApplicantsApi(reservationId: number) {
  const response = await apiClient.get(`/api/v1/reservations/${reservationId}/applicants`);

  const parsed = applicantListResponseDtoSchema.safeParse(response.data.data);

  if (!parsed.success) {
    throw new Error("Invalid applicants response");
  }

  return parsed.data;
}
