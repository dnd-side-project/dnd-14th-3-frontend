import { useQuery } from "@tanstack/react-query";

import { getUserConsentsApi } from "@/api/user";

import { getUserIdFromToken } from "@/services/auth";

import { queryKeys } from "@/queries/keys";

export function useGetUserConsents() {
  const userId = getUserIdFromToken();
  return useQuery({
    queryKey: queryKeys.user.consents,
    queryFn: () => getUserConsentsApi(userId),
  });
}
