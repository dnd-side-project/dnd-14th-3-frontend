import type { CreateMatchRequestResponse } from "@/types/main-map/match-request.type";

import { apiClient } from "@/api/client";

export async function retryMatchRequestApi(
  matchRequestId: number
): Promise<CreateMatchRequestResponse> {
  const response = await apiClient.patch<CreateMatchRequestResponse>(
    `/api/v1/match-requests/${matchRequestId}/retry`
  );
  return response.data;
}

