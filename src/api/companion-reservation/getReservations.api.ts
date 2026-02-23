import type { ReservationSearchCondition } from "@/types/companion-reservation";
import { pageResponseReservationSummaryDtoSchema } from "@/types/companion-reservation";

import { apiClient } from "@/api/client";

interface ReservationItemDto {
  reservationId: number;
  ownerId: number;
  ownerNickname: string;
  ownerProfileImageUrl?: string;
  ownerGender: string;
  title: string;
  scheduledAt: string;
  region1Depth: string;
  specificPlace: string;
  shootingDuration: number;
  status: string;
  isImminent: boolean;
}

interface ReservationListResponse {
  data: ReservationItemDto[];
  success: boolean;
  message: string;
  code: string | null;
}

export interface GetReservationsParams {
  condition: ReservationSearchCondition;
  cursor?: number;
  limit?: number;
}

export async function getReservationsApi(params: GetReservationsParams) {
  const response = await apiClient.get<ReservationListResponse>("/api/v1/reservations", {
    params,
  });

  const parsed = pageResponseReservationSummaryDtoSchema.safeParse(response.data.data);

  if (!parsed.success) {
    throw new Error("Invalid reservation list response");
  }

  return parsed.data;
}
