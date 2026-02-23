import { useQuery } from "@tanstack/react-query";

import { getUserConsentsApi } from "@/api/user";

import { queryKeys } from "@/queries/keys";

export function useGetUserConsents() {
  return useQuery({
    queryKey: queryKeys.user.consents,
    queryFn: () => getUserConsentsApi(),
  });
}
