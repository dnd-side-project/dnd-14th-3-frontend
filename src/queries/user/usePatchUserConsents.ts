import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchUserConsentsApi, type PatchUserConsentsRequest } from "@/api/user";

import { queryKeys } from "@/queries/keys";

export function usePatchUserConsents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.user.consents,
    mutationFn: (body: PatchUserConsentsRequest) => patchUserConsentsApi(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}
