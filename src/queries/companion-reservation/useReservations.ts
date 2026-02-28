import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

import type {
  PageResponseReservationSummaryDto,
  ReservationSearchCondition,
} from "@/types/companion-reservation";

import { getReservationsApi, type GetReservationsParams } from "@/api/companion-reservation";

import { queryKeys } from "@/queries/keys";

type UseReservationsParams = Pick<GetReservationsParams, "limit"> & {
  initialCursor?: number;
  condition?: ReservationSearchCondition;
};

const FIFTEEN_SECONDS = 1000 * 15;
const ONE_MINUTES = 1000 * 60;

export function useReservations(params: UseReservationsParams = {}) {
  const condition = params.condition ?? {};

  return useInfiniteQuery<
    PageResponseReservationSummaryDto,
    Error,
    InfiniteData<PageResponseReservationSummaryDto>,
    ReturnType<typeof queryKeys.reservation.list>,
    number | undefined
  >({
    queryKey: queryKeys.reservation.list(condition, params.limit),
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === "number" ? pageParam : undefined;
      return getReservationsApi({ condition, cursor, limit: params.limit });
    },
    initialPageParam: params.initialCursor ?? undefined,
    getNextPageParam: (lastPage) => {
      // nextCursor가 null이면 undefined 반환하여 더 이상 페이지가 없음을 나타냄
      return lastPage.nextCursor ?? undefined;
    },
    staleTime: FIFTEEN_SECONDS,
    gcTime: ONE_MINUTES,
  });
}
