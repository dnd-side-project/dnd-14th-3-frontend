import { useCallback } from "react";

import { type LatLng } from "@/types/main-map/location.type";

import { Toast } from "@/store/shared/toast/toast.store";

interface UseMainMapFabActionsParams {
  currentLocation: LatLng | null;
  setIsManualLocationMode: (isManualLocationMode: boolean) => void;
  centerMapOnLocation: (location: LatLng) => void;
  openCurrentLocationSheet: () => void;
  closeCurrentLocationSheet: () => void;
  lookupAddress: (location: LatLng) => void;
  enterManualLocationMode: () => void;
  setCurrentLocation: (location: LatLng) => void;
  setPersistedLocation: (location: LatLng, source: "manual" | "shared") => void;
}

export function useMainMapFabActions({
  currentLocation,
  setIsManualLocationMode,
  centerMapOnLocation,
  openCurrentLocationSheet,
  closeCurrentLocationSheet,
  lookupAddress,
  enterManualLocationMode,
  setCurrentLocation,
  setPersistedLocation,
}: UseMainMapFabActionsParams) {
  const handleFindCompanion = useCallback(() => {
    setIsManualLocationMode(false);

    if (!currentLocation) {
      Toast.show({
        message: "위치가 아직 설정되지 않았어요. 위치 공유를 허용하거나 수동 위치를 설정해 주세요.",
        type: "warning",
        duration: 2500,
      });
      return;
    }

    centerMapOnLocation(currentLocation);
    openCurrentLocationSheet();
    lookupAddress(currentLocation);
  }, [
    centerMapOnLocation,
    currentLocation,
    lookupAddress,
    openCurrentLocationSheet,
    setIsManualLocationMode,
  ]);

  const handleOpenManualLocationSetting = useCallback(() => {
    closeCurrentLocationSheet();
    enterManualLocationMode();
  }, [closeCurrentLocationSheet, enterManualLocationMode]);

  const handleResolveLocation = useCallback(
    (location: LatLng) => {
      setCurrentLocation(location);
      centerMapOnLocation(location);
      setPersistedLocation(location, "shared");
      lookupAddress(location);
    },
    [
      centerMapOnLocation,
      lookupAddress,
      setCurrentLocation,
      setPersistedLocation,
    ]
  );

  return {
    handleFindCompanion,
    handleOpenManualLocationSetting,
    handleResolveLocation,
  };
}
