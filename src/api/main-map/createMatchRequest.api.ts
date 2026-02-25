import type {
  CreateMatchRequestPayload,
  CreateMatchRequestResponse,
} from "@/types/main-map/match-request.type";

import { apiClient } from "@/api/client";
import { logger } from "@/lib/shared/logger";

export async function createMatchRequestApi(
  payload: CreateMatchRequestPayload
): Promise<CreateMatchRequestResponse> {
  logger.info("[match-request] request start", payload);

  try {
    const response = await apiClient.post<CreateMatchRequestResponse>(
      "/api/v1/match-requests",
      payload
    );
    logger.info("[match-request] request success", {
      status: response.status,
      code: response.data?.code,
      message: response.data?.message,
      matchRequestId: response.data?.data?.matchRequestId,
    });
    return response.data;
  } catch (error) {
    logger.error(error, { tag: "match-request-api", payload });
    throw error;
  }
}
