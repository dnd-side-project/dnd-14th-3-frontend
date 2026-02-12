import { useQuery } from "@tanstack/react-query";

import { validateSessionApi } from "@/api/auth.api";

import { queryKeys } from "@/queries/keys";

type Options = {
  accessToken: string | null;
  pathname: string;
};

export function useValidateSessionQuery({ accessToken, pathname }: Options) {
  return useQuery({
    queryKey: queryKeys.auth.validate(pathname),
    queryFn: () => validateSessionApi(accessToken as string),
    enabled: Boolean(accessToken),
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}

