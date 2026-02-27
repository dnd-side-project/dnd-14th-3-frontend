import { useQuery } from "@tanstack/react-query";

import { getMatchSessionApi } from "@/api/main-map";

import { queryKeys } from "@/queries/keys";

export function useGetMatchSession(sessionId?: number | null) {
  return useQuery({
    queryKey: queryKeys.match.session(sessionId ?? -1),
    queryFn: () => getMatchSessionApi(sessionId!),
    enabled: typeof sessionId === "number" && Number.isFinite(sessionId),
  });
}
