import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchUserConsentsApi, type PatchUserConsentsRequest } from "@/api/user";

import { getUserIdFromToken } from "@/services/auth";

import { queryKeys } from "@/queries/keys";

export function usePatchUserConsents() {
  const queryClient = useQueryClient();
  const userId = getUserIdFromToken();

  return useMutation({
    mutationKey: queryKeys.user.consents,
    mutationFn: (body: PatchUserConsentsRequest) => patchUserConsentsApi(userId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}
