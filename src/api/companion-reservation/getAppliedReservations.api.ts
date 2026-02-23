import { pageResponseAppliedReservationListDtoSchema } from "@/types/companion-reservation";

import { apiClient } from "@/api/client";

export interface GetAppliedReservationsParams {
  cursor?: number;
  limit?: number;
}

export async function getAppliedReservationsApi(params: GetAppliedReservationsParams) {
  const response = await apiClient.get("/api/v1/reservations/applied", { params });

  const parsed = pageResponseAppliedReservationListDtoSchema.safeParse(response.data.data);

  if (!parsed.success) {
    throw new Error("Invalid applied reservations response");
  }

  return parsed.data;
}
