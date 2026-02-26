import type { MatchProposalEventData } from "./sse.api";

import { logger } from "@/lib/shared/logger";

import { apiClient } from "@/api/client";

type AcceptMatchProposalResponse = {
  success: boolean;
  message: string;
  code: string;
  data: MatchProposalEventData;
};

export async function acceptMatchProposalApi(
  proposalId: number
): Promise<AcceptMatchProposalResponse> {
  logger.info("[match-proposal] accept request start", { proposalId });

  try {
    const response = await apiClient.post<AcceptMatchProposalResponse>(
      `/api/v1/match-proposals/${proposalId}/accept`
    );
    logger.info("[match-proposal] accept request success", {
      proposalId,
      status: response.status,
      code: response.data?.code,
      message: response.data?.message,
      matchProposalId: response.data?.data?.id,
    });
    return response.data;
  } catch (error) {
    logger.error(error, { tag: "match-proposal-accept-api", proposalId });
    throw error;
  }
}
