import { useQuery } from "@tanstack/react-query";

import { getUserProfileApi } from "@/api/user";

import { getUserIdFromToken } from "@/services/auth";

import { queryKeys } from "@/queries/keys";

export function useGetUserProfile() {
  const userId = getUserIdFromToken();
  return useQuery({
    queryKey: queryKeys.user.profile(userId),
    queryFn: () => getUserProfileApi(userId!),
    enabled: !!userId,
  });
}
