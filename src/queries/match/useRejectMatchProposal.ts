import { useMutation, useQueryClient } from "@tanstack/react-query";

import { rejectMatchProposalApi } from "@/api/main-map";

import { queryKeys } from "@/queries/keys";

export function useRejectMatchProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...queryKeys.match.proposals, "reject"] as const,
    mutationFn: (proposalId: number) => rejectMatchProposalApi(proposalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.match.proposals });
    },
  });
}
