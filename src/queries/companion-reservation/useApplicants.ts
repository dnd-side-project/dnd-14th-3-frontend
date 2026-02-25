import { useQuery } from "@tanstack/react-query";

import { getApplicantsApi } from "@/api/companion-reservation";

import { queryKeys } from "@/queries/keys";

const FIVE_MINUTES = 1000 * 60 * 5;

export function useApplicants(reservationId: number) {
  return useQuery({
    queryKey: queryKeys.reservation.applicants(reservationId),
    queryFn: () => getApplicantsApi(reservationId),
    staleTime: FIVE_MINUTES,
    enabled: Boolean(reservationId),
  });
}
