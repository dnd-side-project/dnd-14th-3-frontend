import { useCallback, useEffect } from "react";

import { useKakaoLoader } from "react-kakao-maps-sdk";

import { type LatLng, type SearchLocationResult } from "@/types/main-map/location.type";

import { useMainMapLocationStore } from "@/store/main-map/location.store";

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
  const persistedLocation = useMainMapLocationStore((state) => state.selectedLocation);
  const setPersistedLocation = useMainMapLocationStore((state) => state.setSelectedLocation);
  const currentLocationSheet = useBottomSheet();

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

  const { clearManualConfirmTimer, handleManualMapDragEnd, handleManualMapClick } =
    useManualLocationFlow({
      isManualLocationMode,
      hasManualLocationInteracted,
      setHasManualLocationInteracted,
      setManualLocationDraft,
      setCurrentLocation,
      onConfirmManualLocation: confirmManualLocation,
    });

  const { handleFindCompanion, handleOpenManualLocationSetting, handleResolveLocation } =
    useMainMapFabActions({
      currentLocation,
      clearManualConfirmTimer,
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
      clearManualConfirmTimer();
      setCurrentLocation(nextLocation);
      setPersistedLocation(nextLocation, "manual");
      lookupAddress(nextLocation);
    },
    [
      clearManualConfirmTimer,
      currentLocationSheet.isOpen,
      handleManualMapDragEnd,
      isManualLocationMode,
      lookupAddress,
      setCurrentLocation,
      setPersistedLocation,
      syncMapCenterOnDragEnd,
    ]
  );

  const handleSearchLocation = useCallback(
    (query: string) =>
      new Promise<SearchLocationResult[]>((resolve) => {
        if (typeof window === "undefined" || !window.kakao?.maps?.services) {
          resolve([]);
          return;
        }

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(query, (addressResults, addressStatus) => {
          if (addressStatus === window.kakao.maps.services.Status.OK && addressResults.length > 0) {
            const results: SearchLocationResult[] = addressResults.map((item, index) => ({
              id: `address-${item.x}-${item.y}-${index}`,
              title: item.address_name,
              address: item.road_address?.address_name ?? item.address_name,
              location: { lat: Number(item.y), lng: Number(item.x) },
            }));
            resolve(results);
            return;
          }

          const places = new window.kakao.maps.services.Places();
          places.keywordSearch(query, (keywordResults, keywordStatus) => {
            if (
              keywordStatus !== window.kakao.maps.services.Status.OK ||
              keywordResults.length === 0
            ) {
              // Toast.show({
              //   message: "검색 결과를 찾지 못했어요.",
              //   type: "warning",
              //   duration: 2500,
              // });
              resolve([]);
              return;
            }

            const results: SearchLocationResult[] = keywordResults.map((item, index) => ({
              id: `place-${item.id ?? `${item.x}-${item.y}`}-${index}`,
              title: item.place_name,
              address: item.road_address_name || item.address_name,
              location: { lat: Number(item.y), lng: Number(item.x) },
            }));
            resolve(results);
          });
        });
      }),
    []
  );

  const handleSelectSearchLocation = useCallback(
    (location: LatLng) => {
      clearManualConfirmTimer();
      confirmManualLocation(location);
    },
    [clearManualConfirmTimer, confirmManualLocation]
  );

  useEffect(() => {
    if (!isManualLocationMode) return;
    const center = mapRef.current?.getCenter();
    if (!center) return;
    setManualLocationDraft({ lat: center.getLat(), lng: center.getLng() });
  }, [isManualLocationMode, mapRef, setManualLocationDraft]);

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
        isSheetOpen={currentLocationSheet.isOpen}
        sheetKey={currentLocationSheet.key}
        addressInfo={addressInfo}
        isResolvingAddress={isResolvingAddress}
        onMapCreate={handleMapCreate}
        onMapDragEnd={handleMapDragEnd}
        onManualMapClick={handleManualMapClick}
        onSearchLocation={handleSearchLocation}
        onSelectSearchLocation={handleSelectSearchLocation}
        onBottomSheetSnapChange={handleBottomSheetSnapChange}
      />

      {!isManualLocationMode ? (
        <ExpandableFab
          onFindCompanion={handleFindCompanion}
          onOpenManualLocationSetting={handleOpenManualLocationSetting}
          onResolveLocation={handleResolveLocation}
        />
      ) : null}
    </>
  );
}
