import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  getCachedUserConsents,
  setCachedUserConsents,
} from "@/lib/permission/location-consent-storage";

import { getUserConsentsApi } from "@/api/user";

import { getUserIdFromToken } from "@/services/auth";

import { queryKeys } from "@/queries/keys";

export function useGetUserConsents() {
  const userId = getUserIdFromToken();
  const cachedConsents = getCachedUserConsents();
  const query = useQuery({
    queryKey: queryKeys.user.consents(userId),
    queryFn: () => getUserConsentsApi(userId!),
    enabled: !!userId,
    placeholderData: userId && cachedConsents ? cachedConsents : undefined,
  });

  useEffect(() => {
    if (!query.data) return;
    setCachedUserConsents({
      locationAllowed: query.data.locationAllowed,
      notificationAllowed: query.data.notificationAllowed,
    });
  }, [query.data]);

  return query;
}
