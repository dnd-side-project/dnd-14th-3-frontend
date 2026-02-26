import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelMatchRequestApi } from "@/api/main-map";

import { queryKeys } from "@/queries/keys";

export function useCancelMatchRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...queryKeys.match.all, "cancel"] as const,
    mutationFn: () => cancelMatchRequestApi(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.match.all });
    },
  });
}
