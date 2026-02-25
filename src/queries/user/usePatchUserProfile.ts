import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchUserProfileApi, type PatchUserProfileRequest } from "@/api/user";

import { getUserIdFromToken } from "@/services/auth";

import { queryKeys } from "@/queries/keys";

export function usePatchUserProfile() {
  const queryClient = useQueryClient();
  const userId = getUserIdFromToken();

  return useMutation({
    mutationKey: queryKeys.user.profile(userId),
    mutationFn: (body: PatchUserProfileRequest) => patchUserProfileApi(userId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile(userId) });
    },
  });
}
