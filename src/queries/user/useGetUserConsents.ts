import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  getCachedUserConsents,
  setCachedUserConsents,
} from "@/lib/permission/location-consent-storage";

import { getUserConsentsApi } from "@/api/user";

import { getUserIdFromToken } from "@/services/auth";

import { queryKeys } from "@/queries/keys";

import { getLocationPermissionState } from "@/utils/main-map/geolocation";

export function useGetUserConsents() {
  const userId = getUserIdFromToken();
  const cachedConsents = getCachedUserConsents(userId);
  const query = useQuery({
    queryKey: queryKeys.user.consents(userId),
    queryFn: () => getUserConsentsApi(userId!),
    enabled: !!userId,
    placeholderData: userId && cachedConsents ? cachedConsents : undefined,
  });

  useEffect(() => {
    if (!query.data) return;
    let cancelled = false;
    void (async () => {
      const permissionState = await getLocationPermissionState();
      if (cancelled) return;
      setCachedUserConsents(userId, {
        locationAllowed: permissionState === "denied" ? false : query.data.locationAllowed,
        notificationAllowed: query.data.notificationAllowed,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [query.data, userId]);

  return query;
}
