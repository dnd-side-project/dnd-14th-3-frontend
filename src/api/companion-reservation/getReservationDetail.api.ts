import { reservationDetailDtoSchema } from "@/types/companion-reservation";

import { apiClient } from "@/api/client";

export async function getReservationDetailApi(reservationId: number) {
  const response = await apiClient.get(`/api/v1/reservations/${reservationId}`);

  const parsed = reservationDetailDtoSchema.safeParse(response.data.data);

  if (!parsed.success) {
    throw new Error("Invalid reservation detail response");
  }

  return parsed.data;
}
