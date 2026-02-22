import { useQuery } from "@tanstack/react-query";

import { fetchShootingStylesApi } from "@/api/on-board/profile";

import { queryKeys } from "@/queries/keys";

export function useShootingStyles() {
  return useQuery({
    queryKey: queryKeys.onboard.shootingStyles,
    queryFn: fetchShootingStylesApi,
    staleTime: 1000 * 60 * 10,
  });
}
