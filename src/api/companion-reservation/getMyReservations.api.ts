import { pageResponseCreatedReservationListDtoSchema } from "@/types/companion-reservation";

import { apiClient } from "@/api/client";

export interface GetMyReservationsParams {
  cursor?: number;
  limit?: number;
}

export async function getMyReservationsApi(params: GetMyReservationsParams) {
  const response = await apiClient.get("/api/v1/reservations/created", { params });

  const parsed = pageResponseCreatedReservationListDtoSchema.safeParse(response.data.data);

  if (!parsed.success) {
    throw new Error("Invalid my reservations response");
  }

  return parsed.data;
}
