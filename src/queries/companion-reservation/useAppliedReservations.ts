import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

import type { PageResponseAppliedReservationListDto } from "@/types/companion-reservation";

import {
  getAppliedReservationsApi,
  type GetAppliedReservationsParams,
} from "@/api/companion-reservation";

import { queryKeys } from "@/queries/keys";

type UseAppliedReservationsParams = Pick<GetAppliedReservationsParams, "limit"> & {
  initialCursor?: number;
};

const FIVE_MINUTES = 1000 * 60 * 5;
const TEN_MINUTES = 1000 * 60 * 10;

export function useAppliedReservations(params: UseAppliedReservationsParams = {}) {
  return useInfiniteQuery<
    PageResponseAppliedReservationListDto,
    Error,
    InfiniteData<PageResponseAppliedReservationListDto>,
    ReturnType<typeof queryKeys.reservation.mine.applied>,
    number | undefined
  >({
    queryKey: queryKeys.reservation.mine.applied(params.initialCursor, params.limit),
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === "number" ? pageParam : undefined;
      return getAppliedReservationsApi({ cursor, limit: params.limit });
    },
    initialPageParam: params.initialCursor ?? undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: FIVE_MINUTES,
    gcTime: TEN_MINUTES,
  });
}
