import { useMutation, useQueryClient } from "@tanstack/react-query";

import { acceptMatchProposalApi } from "@/api/main-map";

import { queryKeys } from "@/queries/keys";

export function useAcceptMatchProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...queryKeys.match.proposals, "accept"] as const,
    mutationFn: (proposalId: number) => acceptMatchProposalApi(proposalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.match.proposals });
    },
  });
}
