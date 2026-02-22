import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import { useKakaoLoader } from "react-kakao-maps-sdk";

import { type LatLng } from "@/types/main-map/location.type";

import { usePageLayoutStore } from "@/store/layout/pageLayout.store";
import { useMainMapLocationStore } from "@/store/main-map/location.store";
import { Toast } from "@/store/shared/toast/toast.store";

import { useMainMapFabActions } from "@/hooks/main-map/useMainMapFabActions";
import { useMainMapState } from "@/hooks/main-map/useMainMapState";
import { useManualLocationFlow } from "@/hooks/main-map/useManualLocationFlow";
import { useMapAddressLookup } from "@/hooks/main-map/useMapAddressLookup";
import { useBottomSheet } from "@/hooks/shared/bottom-sheet";

import ExpandableFab from "@/components/main-map/ExpandableFab";
import MainMapView from "@/components/main-map/MainMapView";
import { LoadingIndicator } from "@/components/shared/loading";

export default function MainMapPage() {
  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
  const [searchParams, setSearchParams] = useSearchParams();
  const persistedLocation = useMainMapLocationStore((state) => state.selectedLocation);
  const setPersistedLocation = useMainMapLocationStore((state) => state.setSelectedLocation);
  const setLayoutOptions = usePageLayoutStore((state) => state.setLayoutOptions);
  const resetLayoutOptions = usePageLayoutStore((state) => state.resetLayoutOptions);
  const currentLocationSheet = useBottomSheet();
  const isManualSearchPage = searchParams.get("manualSearch") === "1";
  const wasManualLocationModeRef = useRef(false);

  const {
    mapCenter,
    currentLocation,
    isManualLocationMode,
    hasManualLocationInteracted,
    mapRef,
    setCurrentLocation,
    setManualLocationDraft,
    setIsManualLocationMode,
    setHasManualLocationInteracted,
    panMapToLocation,
    centerMapOnLocation,
    handleMapDragEnd: syncMapCenterOnDragEnd,
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

  const { handleManualMapDragEnd, handleManualMapClick } = useManualLocationFlow({
    isManualLocationMode,
    hasManualLocationInteracted,
    setHasManualLocationInteracted,
    setManualLocationDraft,
    setCurrentLocation,
  });

  const { handleFindCompanion, handleOpenManualLocationSetting, handleResolveLocation } =
    useMainMapFabActions({
      currentLocation,
      setIsManualLocationMode,
      centerMapOnLocation,
      openCurrentLocationSheet: currentLocationSheet.open,
      closeCurrentLocationSheet: currentLocationSheet.close,
      lookupAddress,
      enterManualLocationMode,
      setCurrentLocation: (location) => setCurrentLocation(location),
      setPersistedLocation,
    });

  const handleMapDragEnd = useCallback(
    (map: kakao.maps.Map) => {
      syncMapCenterOnDragEnd(map);

      if (isManualLocationMode) {
        handleManualMapDragEnd(map);
        return;
      }

      if (!currentLocationSheet.isOpen) return;
      const center = map.getCenter();
      const nextLocation = { lat: center.getLat(), lng: center.getLng() };
      setCurrentLocation(nextLocation);
      setPersistedLocation(nextLocation, "manual");
      lookupAddress(nextLocation);
    },
    [
      currentLocationSheet.isOpen,
      handleManualMapDragEnd,
      isManualLocationMode,
      lookupAddress,
      setCurrentLocation,
      setPersistedLocation,
      syncMapCenterOnDragEnd,
    ]
  );

  const handleSelectSearchLocation = useCallback(
    (location: LatLng) => {
      setCurrentLocation(location);
      centerMapOnLocation(location);

      if (isManualLocationMode) {
        setManualLocationDraft(location);
      } else {
        setPersistedLocation(location, "manual");
        lookupAddress(location);
      }

      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("manualSearch");
      setSearchParams(nextParams);
    },
    [
      centerMapOnLocation,
      isManualLocationMode,
      lookupAddress,
      searchParams,
      setCurrentLocation,
      setManualLocationDraft,
      setPersistedLocation,
      setSearchParams,
    ]
  );

  const handleConfirmManualLocation = useCallback(() => {
    if (!currentLocation) return;
    confirmManualLocation(currentLocation);
  }, [confirmManualLocation, currentLocation]);

  const handleOpenManualSearchPage = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("manualSearch", "1");
    setSearchParams(nextParams);
  }, [searchParams, setSearchParams]);

  const closeManualSearchPage = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("manualSearch");
    setSearchParams(nextParams);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!isManualLocationMode) return;
    const center = mapRef.current?.getCenter();
    if (!center) return;
    setManualLocationDraft({ lat: center.getLat(), lng: center.getLng() });
  }, [isManualLocationMode, mapRef, setManualLocationDraft]);

  useEffect(() => {
    if (!isManualLocationMode || wasManualLocationModeRef.current) return;
    Toast.show({
      message: "현재 내 위치로 핀을 이동해 주세요",
      type: "info",
      duration: 3000,
    });
  }, [isManualLocationMode]);

  useEffect(() => {
    wasManualLocationModeRef.current = isManualLocationMode;
  }, [isManualLocationMode]);

  useEffect(() => {
    if (!isManualSearchPage) {
      resetLayoutOptions();
      return;
    }

    setLayoutOptions({
      leftAction: "back",
      onLeftActionClick: closeManualSearchPage,
      showRightActions: false,
      showBottomNav: false,
    });

    return () => resetLayoutOptions();
  }, [closeManualSearchPage, isManualSearchPage, resetLayoutOptions, setLayoutOptions]);

  useEffect(() => {
    if (!isManualSearchPage) return;
    if (isManualLocationMode || currentLocationSheet.isOpen) return;
    closeManualSearchPage();
  }, [closeManualSearchPage, currentLocationSheet.isOpen, isManualLocationMode, isManualSearchPage]);

  useEffect(() => {
    if (!currentLocationSheet.isOpen || isManualLocationMode) return;
    const center = mapRef.current?.getCenter();
    if (!center) return;
    const nextLocation = { lat: center.getLat(), lng: center.getLng() };
    setCurrentLocation(nextLocation);
    lookupAddress(nextLocation);
  }, [
    currentLocationSheet.isOpen,
    isManualLocationMode,
    lookupAddress,
    mapRef,
    setCurrentLocation,
  ]);

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
            : "불러올 수 없습니다. 잠시 후 다시 시도해주세요."}
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
    <>
      <MainMapView
        mapCenter={mapCenter}
        currentLocation={currentLocation}
        isManualLocationMode={isManualLocationMode}
        isManualSearchPage={isManualSearchPage}
        isSheetOpen={currentLocationSheet.isOpen}
        sheetKey={currentLocationSheet.key}
        addressInfo={addressInfo}
        isResolvingAddress={isResolvingAddress}
        mapHandlers={{
          create: handleMapCreate,
          dragEnd: handleMapDragEnd,
          manualClick: handleManualMapClick,
        }}
        manualActions={{
          selectSearchLocation: handleSelectSearchLocation,
          openSearchPage: handleOpenManualSearchPage,
          confirmLocation: handleConfirmManualLocation,
        }}
        onBottomSheetSnapChange={handleBottomSheetSnapChange}
      />

      {!isManualLocationMode && !isManualSearchPage ? (
        <ExpandableFab
          actions={{
            findCompanion: handleFindCompanion,
            openManualLocationSetting: handleOpenManualLocationSetting,
            resolveLocation: handleResolveLocation,
          }}
        />
      ) : null}
    </>
  );
}
