import { useMutation, useQueryClient } from "@tanstack/react-query";

import { retryMatchRequestApi } from "@/api/main-map";

import { queryKeys } from "@/queries/keys";

export function useRetryMatchRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...queryKeys.match.all, "retry"] as const,
    mutationFn: (matchRequestId: number) => retryMatchRequestApi(matchRequestId),
    onSuccess: (_data, matchRequestId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.match.requestStatus(matchRequestId) });
    },
  });
}
