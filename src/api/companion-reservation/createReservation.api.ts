import type { ReservationCreateRequest } from "@/types/companion-reservation";

import { apiClient } from "@/api/client";

export async function createReservationApi(body: ReservationCreateRequest): Promise<number> {
  const response = await apiClient.post("/api/v1/reservations", body);
  return response.data?.data ?? response.data;
}
