import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateMatchRequestPayload } from "@/types/main-map/match-request.type";

import { createMatchRequestApi } from "@/api/main-map";

import { queryKeys } from "@/queries/keys";

export function useCreateMatchRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...queryKeys.match.all, "create"] as const,
    mutationFn: async (payload: CreateMatchRequestPayload) => createMatchRequestApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.match.all });
    },
  });
}
