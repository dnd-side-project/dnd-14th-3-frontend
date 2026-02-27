import { useMutation, useQueryClient } from "@tanstack/react-query";

import { startMeetingMatchSessionApi } from "@/api/main-map";

import { queryKeys } from "@/queries/keys";

export function useStartMeetingMatchSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...queryKeys.match.all, "session", "start-meeting"] as const,
    mutationFn: (sessionId: number) => startMeetingMatchSessionApi(sessionId),
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.match.session(sessionId) });
    },
  });
}
