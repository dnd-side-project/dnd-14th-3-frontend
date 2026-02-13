import { useQuery } from "@tanstack/react-query";

import { validateSessionApi } from "@/api/auth.api";

import { queryKeys } from "@/queries/keys";

type Options = {
  accessToken: string | null;
};

export function useValidateSessionQuery({ accessToken }: Options) {
  return useQuery({
    queryKey: queryKeys.auth.validate(accessToken ?? ""),
    queryFn: () => validateSessionApi(accessToken as string),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
    gcTime: 0,
    retry: false,
  });
}
