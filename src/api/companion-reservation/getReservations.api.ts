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
  const { condition, cursor, limit } = params;

  // flat query string: keyword=s&region1Depth=SEOUL&cursor=10&limit=10
  const flatParams = {
    ...condition,
    cursor,
    limit,
  };

  const response = await apiClient.get<ReservationListResponse>("/api/v1/reservations", {
    params: flatParams,
  });

  const parsed = pageResponseReservationSummaryDtoSchema.safeParse(response.data.data);

  if (!parsed.success) {
    throw new Error("Invalid reservation list response");
  }

  return parsed.data;
}
