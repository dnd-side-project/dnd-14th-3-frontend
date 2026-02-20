import { type Dispatch, type SetStateAction,useCallback, useEffect, useRef } from "react";

import { type LatLng } from "@/types/main-map/location.type";

import { MANUAL_CONFIRM_DELAY_MS } from "@/constants/main-map/location.constants";

import { Toast } from "@/store/shared/toast/toast.store";

interface UseManualLocationFlowParams {
  isManualLocationMode: boolean;
  hasManualLocationInteracted: boolean;
  setHasManualLocationInteracted: Dispatch<SetStateAction<boolean>>;
  setManualLocationDraft: Dispatch<SetStateAction<LatLng>>;
  setCurrentLocation: Dispatch<SetStateAction<LatLng | null>>;
  onConfirmManualLocation: (location: LatLng) => void;
}

export function useManualLocationFlow({
  isManualLocationMode,
  hasManualLocationInteracted,
  setHasManualLocationInteracted,
  setManualLocationDraft,
  setCurrentLocation,
  onConfirmManualLocation,
}: UseManualLocationFlowParams) {
  const manualConfirmTimerRef = useRef<number | null>(null);

  const clearManualConfirmTimer = useCallback(() => {
    if (manualConfirmTimerRef.current == null) return;
    window.clearTimeout(manualConfirmTimerRef.current);
    manualConfirmTimerRef.current = null;
  }, []);

  const scheduleManualConfirm = useCallback(
    (location: LatLng) => {
      clearManualConfirmTimer();
      manualConfirmTimerRef.current = window.setTimeout(() => {
        onConfirmManualLocation(location);
      }, MANUAL_CONFIRM_DELAY_MS);
    },
    [clearManualConfirmTimer, onConfirmManualLocation]
  );

  useEffect(() => {
    if (!isManualLocationMode) return;
    const timer = window.setTimeout(() => {
      Toast.show({
        message: "현재 내 위치로 아이콘을 이동해주세요",
        type: "info",
        duration: 86400000,
      });
    }, 100);

    return () => {
      window.clearTimeout(timer);
      Toast.hide();
    };
  }, [isManualLocationMode]);

  useEffect(() => clearManualConfirmTimer, [clearManualConfirmTimer]);

  const markInteraction = useCallback(() => {
    if (hasManualLocationInteracted) return;
    setHasManualLocationInteracted(true);
    Toast.hide();
  }, [hasManualLocationInteracted, setHasManualLocationInteracted]);

  const handleManualMarkerDragEnd = useCallback(
    (marker: kakao.maps.Marker) => {
      const position = marker.getPosition();
      const nextLocation = { lat: position.getLat(), lng: position.getLng() };
      markInteraction();
      setManualLocationDraft(nextLocation);
      setCurrentLocation(nextLocation);
      scheduleManualConfirm(nextLocation);
    },
    [markInteraction, scheduleManualConfirm, setCurrentLocation, setManualLocationDraft]
  );

  const handleManualMapClick = useCallback(
    (_map: kakao.maps.Map, mouseEvent: kakao.maps.event.MouseEvent) => {
      if (!isManualLocationMode) return;
      const clicked = mouseEvent.latLng;
      const nextLocation = { lat: clicked.getLat(), lng: clicked.getLng() };
      markInteraction();
      setManualLocationDraft(nextLocation);
      setCurrentLocation(nextLocation);
      scheduleManualConfirm(nextLocation);
    },
    [
      isManualLocationMode,
      markInteraction,
      scheduleManualConfirm,
      setCurrentLocation,
      setManualLocationDraft,
    ]
  );

  return {
    clearManualConfirmTimer,
    handleManualMarkerDragEnd,
    handleManualMapClick,
  };
}
