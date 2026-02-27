import { useQuery } from "@tanstack/react-query";

import { getMatchRequestStatusApi } from "@/api/main-map";

import { queryKeys } from "@/queries/keys";

export function useGetMatchRequestStatus(matchRequestId?: number | null) {
  return useQuery({
    queryKey: queryKeys.match.requestStatus(matchRequestId ?? -1),
    queryFn: () => getMatchRequestStatusApi(matchRequestId!),
    enabled: typeof matchRequestId === "number" && Number.isFinite(matchRequestId),
  });
}
