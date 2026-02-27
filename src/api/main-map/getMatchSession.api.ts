import type { GetMatchSessionResponse } from "@/types/main-map";

import { apiClient } from "@/api/client";

export async function getMatchSessionApi(sessionId: number): Promise<GetMatchSessionResponse> {
  const response = await apiClient.get<GetMatchSessionResponse>(`/api/v1/match-sessions/${sessionId}`);
  return response.data;
}
