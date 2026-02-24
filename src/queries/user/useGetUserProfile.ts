import { useQuery } from "@tanstack/react-query";

import { getUserProfileApi } from "@/api/user";

import { queryKeys } from "@/queries/keys";

export function useGetUserProfile() {
  return useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: () => getUserProfileApi(),
  });
}
