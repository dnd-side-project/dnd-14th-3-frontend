import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  applyReservationApi,
  cancelReservationApi,
  createCommentApi,
} from "@/api/companion-reservation";

import { queryKeys } from "@/queries/keys";

interface UseCompanionDetailMutationsParams {
  id: number;
  onApplySuccess?: () => void;
  onCommentSuccess?: () => void;
}

export function useCompanionDetailMutations({
  id,
  onApplySuccess,
  onCommentSuccess,
}: UseCompanionDetailMutationsParams) {
  const queryClient = useQueryClient();

  const applyMutation = useMutation({
    mutationFn: () => applyReservationApi(id),
    onSuccess: () => {
      onApplySuccess?.();
      void queryClient.invalidateQueries({ queryKey: queryKeys.reservation.detail(id) });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => createCommentApi(id, { content }),
    onSuccess: () => {
      onCommentSuccess?.();
      void queryClient.invalidateQueries({ queryKey: queryKeys.reservation.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reservation.comments(id) });
    },
  });

  const cancelReservationMutation = useMutation({
    mutationFn: () => cancelReservationApi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reservation.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reservation.list() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reservation.mine.posted() });
    },
  });

  return {
    applyMutation,
    createCommentMutation,
    cancelReservationMutation,
  };
}
