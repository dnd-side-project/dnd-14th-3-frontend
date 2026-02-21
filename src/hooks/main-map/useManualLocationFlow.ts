import { type Dispatch, type SetStateAction, useCallback } from "react";

import { type LatLng } from "@/types/main-map/location.type";

import { Toast } from "@/store/shared/toast/toast.store";

interface UseManualLocationFlowParams {
  isManualLocationMode: boolean;
  hasManualLocationInteracted: boolean;
  setHasManualLocationInteracted: Dispatch<SetStateAction<boolean>>;
  setManualLocationDraft: Dispatch<SetStateAction<LatLng>>;
  setCurrentLocation: Dispatch<SetStateAction<LatLng | null>>;
}

export function useManualLocationFlow({
  isManualLocationMode,
  hasManualLocationInteracted,
  setHasManualLocationInteracted,
  setManualLocationDraft,
  setCurrentLocation,
}: UseManualLocationFlowParams) {
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
    },
    [markInteraction, setCurrentLocation, setManualLocationDraft]
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
    handleManualMapDragEnd,
    handleManualMapClick,
  };
}
