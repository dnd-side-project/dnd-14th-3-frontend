import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

import type { PageResponseReservationCommentDto } from "@/types/companion-reservation";

import { getCommentsApi, type GetCommentsParams } from "@/api/companion-reservation";

import { queryKeys } from "@/queries/keys";

type UseCommentsParams = Pick<GetCommentsParams, "limit"> & {
  initialCursor?: number;
};

const FIVE_MINUTES = 1000 * 60 * 5;
const TEN_MINUTES = 1000 * 60 * 10;

export function useComments(reservationId: number, params: UseCommentsParams = {}) {
  return useInfiniteQuery<
    PageResponseReservationCommentDto,
    Error,
    InfiniteData<PageResponseReservationCommentDto>,
    ReturnType<typeof queryKeys.reservation.comments>,
    number | undefined
  >({
    queryKey: queryKeys.reservation.comments(reservationId, params.initialCursor, params.limit),
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === "number" ? pageParam : undefined;
      return getCommentsApi(reservationId, { cursor, limit: params.limit });
    },
    initialPageParam: params.initialCursor ?? undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: FIVE_MINUTES,
    gcTime: TEN_MINUTES,
    enabled: Boolean(reservationId),
  });
}
