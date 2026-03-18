import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setCachedUserConsents } from "@/lib/permission/location-consent-storage";

import { patchUserConsentsApi, type PatchUserConsentsRequest } from "@/api/user";

import { getUserIdFromToken } from "@/services/auth";

import { queryKeys } from "@/queries/keys";

export function usePatchUserConsents() {
  const queryClient = useQueryClient();
  const userId = getUserIdFromToken();

  return useMutation({
    mutationKey: queryKeys.user.consents(userId),
    mutationFn: (body: PatchUserConsentsRequest) => patchUserConsentsApi(userId, body),
    onSuccess: (data) => {
      setCachedUserConsents(userId, {
        locationAllowed: data.locationAllowed,
        notificationAllowed: data.notificationAllowed,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}
