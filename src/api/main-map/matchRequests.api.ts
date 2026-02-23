import type {
  CreateMatchRequestPayload,
  CreateMatchRequestResponse,
} from "@/types/main-map/match-request.type";

import { apiClient } from "@/api/client";

export async function createMatchRequestApi(
  payload: CreateMatchRequestPayload
): Promise<CreateMatchRequestResponse> {
  const response = await apiClient.post<CreateMatchRequestResponse>(
    "/api/v1/match-requests",
    payload
  );
  return response.data;
}
