import { useMutation, useQueryClient } from "@tanstack/react-query";

import { arriveMatchSessionApi } from "@/api/main-map";

import { queryKeys } from "@/queries/keys";

export function useArriveMatchSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...queryKeys.match.all, "session", "arrive"] as const,
    mutationFn: (sessionId: number) => arriveMatchSessionApi(sessionId),
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.match.session(sessionId) });
    },
  });
}
