import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ReservationCreateRequest } from "@/types/companion-reservation";

import { createReservationApi } from "@/api/companion-reservation";

import { queryKeys } from "@/queries/keys";

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...queryKeys.reservation.mine.posted(), "create"] as const,
    mutationFn: (body: ReservationCreateRequest) => createReservationApi(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reservation.list() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reservation.mine.posted() });
    },
  });
}
