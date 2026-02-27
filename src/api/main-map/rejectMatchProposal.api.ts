import type { MatchProposalEventData } from "@/types/main-map";

import { logger } from "@/lib/shared/logger";

import { apiClient } from "@/api/client";

type RejectMatchProposalResponse = {
  success: boolean;
  message: string;
  code: string;
  data: MatchProposalEventData;
};

export async function rejectMatchProposalApi(
  proposalId: number
): Promise<RejectMatchProposalResponse> {
  logger.info("[match-proposal] reject request start", { proposalId });

  try {
    const response = await apiClient.post<RejectMatchProposalResponse>(
      `/api/v1/match-proposals/${proposalId}/reject`
    );
    logger.info("[match-proposal] reject request success", {
      proposalId,
      status: response.status,
      code: response.data?.code,
      message: response.data?.message,
      matchProposalId: response.data?.data?.id,
    });
    return response.data;
  } catch (error) {
    logger.error(error, { tag: "match-proposal-reject-api", proposalId });
    throw error;
  }
}
