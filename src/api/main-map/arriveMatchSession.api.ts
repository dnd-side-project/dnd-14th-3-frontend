import { logger } from "@/lib/shared/logger";

import { apiClient } from "@/api/client";

export async function arriveMatchSessionApi(sessionId: number): Promise<void> {
  logger.info("[match-session] arrive request start", { sessionId });

  try {
    await apiClient.patch(`/api/v1/match-sessions/${sessionId}/arrive`);
    logger.info("[match-session] arrive request success", { sessionId });
  } catch (error) {
    logger.error(error, { tag: "match-session-arrive-api", sessionId });
    throw error;
  }
}
