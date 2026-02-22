import { useEffect, useState } from "react";

import { getLocationPermissionState } from "@/utils/main-map/geolocation";

export function useManualSearchPermissionGate(isSheetOpen: boolean) {
  const [showManualSearchInCurrentLocationSheet, setShowManualSearchInCurrentLocationSheet] =
    useState(false);

  useEffect(() => {
    let isActive = true;

    if (!isSheetOpen) {
      setShowManualSearchInCurrentLocationSheet(false);
      return () => {
        isActive = false;
      };
    }

    const updatePermissionState = async () => {
      const permissionState = await getLocationPermissionState();
      if (!isActive) return;
      setShowManualSearchInCurrentLocationSheet(permissionState === "denied");
    };

    void updatePermissionState();

    return () => {
      isActive = false;
    };
  }, [isSheetOpen]);

  return { showManualSearchInCurrentLocationSheet };
}

