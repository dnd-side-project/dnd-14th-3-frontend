import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

import type { PageResponseCreatedReservationListDto } from "@/types/companion-reservation";

import { getMyReservationsApi, type GetMyReservationsParams } from "@/api/companion-reservation";

import { queryKeys } from "@/queries/keys";

type UseMyReservationsParams = Pick<GetMyReservationsParams, "limit"> & {
  initialCursor?: number;
};

const FIVE_MINUTES = 1000 * 60 * 5;
const TEN_MINUTES = 1000 * 60 * 10;

export function useMyReservations(params: UseMyReservationsParams = {}) {
  return useInfiniteQuery<
    PageResponseCreatedReservationListDto,
    Error,
    InfiniteData<PageResponseCreatedReservationListDto>,
    ReturnType<typeof queryKeys.reservation.mine.posted>,
    number | undefined
  >({
    queryKey: queryKeys.reservation.mine.posted(params.initialCursor, params.limit),
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === "number" ? pageParam : undefined;
      return getMyReservationsApi({ cursor, limit: params.limit });
    },
    initialPageParam: params.initialCursor ?? undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: FIVE_MINUTES,
    gcTime: TEN_MINUTES,
  });
}
