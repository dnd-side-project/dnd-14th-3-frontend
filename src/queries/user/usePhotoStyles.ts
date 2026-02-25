import { useQuery } from "@tanstack/react-query";

import { fetchPhotoStylesApi } from "@/api/profile";

import { queryKeys } from "@/queries/keys";

export function usePhotoStyles() {
  return useQuery({
    queryKey: queryKeys.user.photoStyles,
    queryFn: fetchPhotoStylesApi,
    staleTime: 1000 * 60 * 10,
  });
}
