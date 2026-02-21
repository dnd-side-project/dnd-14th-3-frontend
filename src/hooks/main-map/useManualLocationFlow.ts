import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef } from "react";

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

  // useEffect(() => {
  //   if (!isManualLocationMode) return;
  //   const timer = window.setTimeout(() => {
  //     Toast.show({
  //       message: "지도를 움직여 현재 위치를 가운데 핀에 맞춰주세요",
  //       type: "info",
  //       duration: 86400000,
  //     });
  //   }, 100);

  //   return () => {
  //     window.clearTimeout(timer);
  //     Toast.hide();
  //   };
  // }, [isManualLocationMode]);

  useEffect(() => clearManualConfirmTimer, [clearManualConfirmTimer]);

  const markInteraction = useCallback(() => {
    if (hasManualLocationInteracted) return;
    setHasManualLocationInteracted(true);
    Toast.hide();
  }, [hasManualLocationInteracted, setHasManualLocationInteracted]);

  const applyManualLocation = useCallback(
    (nextLocation: LatLng) => {
      markInteraction();
      setManualLocationDraft(nextLocation);
      setCurrentLocation(nextLocation);
      scheduleManualConfirm(nextLocation);
    },
    [markInteraction, scheduleManualConfirm, setCurrentLocation, setManualLocationDraft]
  );

  const handleManualMapDragEnd = useCallback(
    (map: kakao.maps.Map) => {
      if (!isManualLocationMode) return;
      const center = map.getCenter();
      applyManualLocation({ lat: center.getLat(), lng: center.getLng() });
    },
    [applyManualLocation, isManualLocationMode]
  );

  const handleManualMapClick = useCallback(
    (map: kakao.maps.Map, mouseEvent: kakao.maps.event.MouseEvent) => {
      if (!isManualLocationMode) return;
      const clicked = mouseEvent.latLng;
      const nextLocation = { lat: clicked.getLat(), lng: clicked.getLng() };
      map.panTo(clicked);
      applyManualLocation(nextLocation);
    },
    [applyManualLocation, isManualLocationMode]
  );

  return {
    applyManualLocation,
    clearManualConfirmTimer,
    handleManualMapDragEnd,
    handleManualMapClick,
  };
}
