import { useMutation } from "@tanstack/react-query";

import type { CreateMatchRequestPayload } from "@/types/main-map/match-request.type";

import { createMatchRequestApi } from "@/api/main-map";

export function useCreateMatchRequest() {
  return useMutation({
    mutationFn: async (payload: CreateMatchRequestPayload) => createMatchRequestApi(payload),
  });
}
