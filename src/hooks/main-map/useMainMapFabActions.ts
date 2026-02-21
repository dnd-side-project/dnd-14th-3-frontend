import { useCallback } from "react";

import { type LatLng } from "@/types/main-map/location.type";

import { Toast } from "@/store/shared/toast/toast.store";

interface UseMainMapFabActionsParams {
  currentLocation: LatLng | null;
  clearManualConfirmTimer: () => void;
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
  clearManualConfirmTimer,
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
    clearManualConfirmTimer();
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
    clearManualConfirmTimer,
    currentLocation,
    lookupAddress,
    openCurrentLocationSheet,
    setIsManualLocationMode,
  ]);

  const handleOpenManualLocationSetting = useCallback(() => {
    clearManualConfirmTimer();
    closeCurrentLocationSheet();
    enterManualLocationMode();
  }, [clearManualConfirmTimer, closeCurrentLocationSheet, enterManualLocationMode]);

  const handleResolveLocation = useCallback(
    (location: LatLng) => {
      clearManualConfirmTimer();
      setCurrentLocation(location);
      centerMapOnLocation(location);
      setPersistedLocation(location, "shared");
      lookupAddress(location);
    },
    [
      centerMapOnLocation,
      clearManualConfirmTimer,
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
