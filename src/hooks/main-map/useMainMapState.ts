import { useCallback, useEffect, useRef, useState } from "react";

import {
  type LatLng,
} from "@/types/main-map/location.type";

import {
  CENTER_SYNC_EPSILON,
  DEFAULT_CENTER,
} from "@/constants/main-map/location.constants";

interface UseMainMapStateParams {
  persistedLocation: LatLng | null;
}

export function useMainMapState({ persistedLocation }: UseMainMapStateParams) {
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [manualLocationDraft, setManualLocationDraft] = useState(DEFAULT_CENTER);
  const [isManualLocationMode, setIsManualLocationMode] = useState(false);
  const [hasManualLocationInteracted, setHasManualLocationInteracted] = useState(false);
  const mapRef = useRef<kakao.maps.Map | null>(null);

  useEffect(() => {
    if (!persistedLocation) return;
    const timer = window.setTimeout(() => {
      setCurrentLocation(persistedLocation);
      setMapCenter(persistedLocation);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [persistedLocation]);

  const panMapToLocation = useCallback((location: LatLng) => {
    if (!mapRef.current || !window.kakao?.maps?.LatLng) return;
    mapRef.current.setCenter(new window.kakao.maps.LatLng(location.lat, location.lng));
  }, []);

  const centerMapOnLocation = useCallback(
    (location: LatLng) => {
      const normalizedLocation = { lat: location.lat, lng: location.lng };
      setMapCenter((prevCenter) => {
        if (
          Math.abs(prevCenter.lat - normalizedLocation.lat) < CENTER_SYNC_EPSILON &&
          Math.abs(prevCenter.lng - normalizedLocation.lng) < CENTER_SYNC_EPSILON
        ) {
          return prevCenter;
        }
        return normalizedLocation;
      });
      panMapToLocation(location);
    },
    [panMapToLocation]
  );

  const handleMapDragEnd = useCallback((map: kakao.maps.Map) => {
    const center = map.getCenter();
    const nextCenter = { lat: center.getLat(), lng: center.getLng() };
    setMapCenter((prevCenter) => {
      if (
        Math.abs(prevCenter.lat - nextCenter.lat) < CENTER_SYNC_EPSILON &&
        Math.abs(prevCenter.lng - nextCenter.lng) < CENTER_SYNC_EPSILON
      ) {
        return prevCenter;
      }
      return nextCenter;
    });
  }, []);

  const enterManualLocationMode = useCallback(() => {
    setIsManualLocationMode(true);
    setHasManualLocationInteracted(false);
    const center = mapRef.current?.getCenter();
    setManualLocationDraft(center ? { lat: center.getLat(), lng: center.getLng() } : mapCenter);
  }, [mapCenter]);

  return {
    mapCenter,
    currentLocation,
    manualLocationDraft,
    isManualLocationMode,
    hasManualLocationInteracted,
    mapRef,
    setCurrentLocation,
    setManualLocationDraft,
    setIsManualLocationMode,
    setHasManualLocationInteracted,
    panMapToLocation,
    centerMapOnLocation,
    handleMapDragEnd,
    enterManualLocationMode,
  };
}
