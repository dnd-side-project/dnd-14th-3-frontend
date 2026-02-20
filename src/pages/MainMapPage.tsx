import { useCallback, useEffect } from "react";

import { useKakaoLoader } from "react-kakao-maps-sdk";

import { type LatLng } from "@/types/main-map/location.type";

import { useMainMapLocationStore } from "@/store/main-map/location.store";
import { Toast } from "@/store/shared/toast/toast.store";

import { useMainMapState } from "@/hooks/main-map/useMainMapState";
import { useManualLocationFlow } from "@/hooks/main-map/useManualLocationFlow";
import { useMapAddressLookup } from "@/hooks/main-map/useMapAddressLookup";
import { useBottomSheet } from "@/hooks/shared/bottom-sheet";

import MainMapView from "@/components/main-map/MainMapView";
import { LoadingIndicator } from "@/components/shared/loading";

export default function MainMapPage() {
  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
  const persistedLocation = useMainMapLocationStore((state) => state.selectedLocation);
  const setPersistedLocation = useMainMapLocationStore((state) => state.setSelectedLocation);
  const currentLocationSheet = useBottomSheet();

  const {
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
  } = useMainMapState({ persistedLocation });

  const { addressInfo, isResolvingAddress, lookupAddress } = useMapAddressLookup(
    currentLocationSheet.isOpen
  );

  const [loading, error] = useKakaoLoader({
    appkey: appKey ?? "",
    libraries: ["services"],
  });

  const confirmManualLocation = useCallback(
    (location: LatLng) => {
      setCurrentLocation(location);
      centerMapOnLocation(location);
      setPersistedLocation(location, "manual");
      setIsManualLocationMode(false);
      currentLocationSheet.open();
      lookupAddress(location);
    },
    [
      centerMapOnLocation,
      currentLocationSheet,
      lookupAddress,
      setCurrentLocation,
      setIsManualLocationMode,
      setPersistedLocation,
    ]
  );

  const { clearManualConfirmTimer, handleManualMarkerDragEnd, handleManualMapClick } =
    useManualLocationFlow({
      isManualLocationMode,
      hasManualLocationInteracted,
      setHasManualLocationInteracted,
      setManualLocationDraft,
      setCurrentLocation,
      onConfirmManualLocation: confirmManualLocation,
    });

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
    currentLocationSheet.open();
    lookupAddress(currentLocation);
  }, [
    centerMapOnLocation,
    clearManualConfirmTimer,
    currentLocation,
    currentLocationSheet,
    lookupAddress,
    setIsManualLocationMode,
  ]);

  const handleOpenManualLocationSetting = useCallback(() => {
    clearManualConfirmTimer();
    currentLocationSheet.close();
    enterManualLocationMode();
  }, [clearManualConfirmTimer, currentLocationSheet, enterManualLocationMode]);

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

  const handleCurrentMarkerDragEnd = useCallback(
    (marker: kakao.maps.Marker) => {
      const position = marker.getPosition();
      const nextLocation = { lat: position.getLat(), lng: position.getLng() };
      clearManualConfirmTimer();
      setCurrentLocation(nextLocation);
      centerMapOnLocation(nextLocation);
      setPersistedLocation(nextLocation, "manual");
      lookupAddress(nextLocation);
    },
    [
      centerMapOnLocation,
      clearManualConfirmTimer,
      lookupAddress,
      setCurrentLocation,
      setPersistedLocation,
    ]
  );

  useEffect(() => {
    if (!currentLocationSheet.isOpen || !currentLocation) return;
    panMapToLocation(currentLocation);
  }, [currentLocationSheet.isOpen, currentLocation, panMapToLocation]);

  const handleBottomSheetSnapChange = useCallback(
    (snapState: "collapsed" | "full") => {
      if (snapState !== "full" || !currentLocation) return;
      centerMapOnLocation(currentLocation);
    },
    [centerMapOnLocation, currentLocation]
  );

  const handleMapCreate = useCallback(
    (map: kakao.maps.Map) => {
      mapRef.current = map;
    },
    [mapRef]
  );

  if (!appKey) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-center text-body-2 text-warning-700">
          {import.meta.env.DEV
            ? "카카오맵 키가 설정되지 않았습니다. .env의 VITE_KAKAO_MAP_APP_KEY를 확인해주세요."
            : "지도를 불러올 수 없습니다. 잠시 후 다시 시도해주세요."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-center text-body-2 text-warning-700">
          지도를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <MainMapView
      mapCenter={mapCenter}
      currentLocation={currentLocation}
      manualLocationDraft={manualLocationDraft}
      isManualLocationMode={isManualLocationMode}
      isSheetOpen={currentLocationSheet.isOpen}
      sheetKey={currentLocationSheet.key}
      addressInfo={addressInfo}
      isResolvingAddress={isResolvingAddress}
      onMapCreate={handleMapCreate}
      onMapDragEnd={handleMapDragEnd}
      onManualMapClick={handleManualMapClick}
      onManualMarkerDragEnd={handleManualMarkerDragEnd}
      onCurrentMarkerDragEnd={handleCurrentMarkerDragEnd}
      onFindCompanion={handleFindCompanion}
      onOpenManualLocationSetting={handleOpenManualLocationSetting}
      onResolveLocation={handleResolveLocation}
      onBottomSheetSnapChange={handleBottomSheetSnapChange}
    />
  );
}
