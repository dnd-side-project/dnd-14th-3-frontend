import type { CreateMatchRequestResponse } from "@/types/main-map/match-request.type";

import { apiClient } from "@/api/client";

export async function getMatchRequestStatusApi(
  matchRequestId: number
): Promise<CreateMatchRequestResponse> {
  const response = await apiClient.get<CreateMatchRequestResponse>(
    `/api/v1/match-requests/${matchRequestId}`
  );
  return response.data;
}
