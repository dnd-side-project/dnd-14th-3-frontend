import { logger } from "@/lib/shared/logger";

import { apiClient } from "@/api/client";

export async function startMeetingMatchSessionApi(sessionId: number): Promise<void> {
  logger.info("[match-session] start meeting request start", { sessionId });

  try {
    await apiClient.patch(`/api/v1/match-sessions/${sessionId}/start-meeting`);
    logger.info("[match-session] start meeting request success", { sessionId });
  } catch (error) {
    logger.error(error, { tag: "match-session-start-meeting-api", sessionId });
    throw error;
  }
}
