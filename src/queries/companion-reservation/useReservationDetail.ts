import { useQuery } from "@tanstack/react-query";

import { getReservationDetailApi } from "@/api/companion-reservation";

import { queryKeys } from "@/queries/keys";

const FIVE_MINUTES = 1000 * 60 * 5;
const TEN_MINUTES = 1000 * 60 * 10;

export function useReservationDetail(reservationId: number) {
  return useQuery({
    queryKey: queryKeys.reservation.detail(reservationId),
    queryFn: () => getReservationDetailApi(reservationId),
    staleTime: FIVE_MINUTES,
    gcTime: TEN_MINUTES,
    enabled: Boolean(reservationId),
  });
}
