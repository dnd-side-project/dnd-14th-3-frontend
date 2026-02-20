import { useCallback, useEffect, useRef, useState } from "react";

import { MapPin } from "lucide-react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

import { useMainMapLocationStore } from "@/store/main-map/location.store";
import { Toast } from "@/store/shared/toast/toast.store";

import { useBottomSheet } from "@/hooks/shared/bottom-sheet";

import ExpandableFab from "@/components/main-map/ExpandableFab";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { LoadingIndicator } from "@/components/shared/loading";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const MANUAL_CONFIRM_DELAY_MS = 5000;
const ADDRESS_LOOKUP_TIMEOUT_MS = 5000;
const PIN_ME = {
  src: "/main-map/pin_me.png",
  size: { width: 60, height: 60 },
  options: { offset: { x: 30, y: 40 } },
};

interface LocationAddressInfo {
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
}

type LatLng = { lat: number; lng: number };

export default function MainMapPage() {
  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [manualLocationDraft, setManualLocationDraft] = useState(DEFAULT_CENTER);
  const [isManualLocationMode, setIsManualLocationMode] = useState(false);
  const [hasManualLocationInteracted, setHasManualLocationInteracted] = useState(false);
  const [addressInfo, setAddressInfo] = useState<LocationAddressInfo | null>(null);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const persistedLocation = useMainMapLocationStore((state) => state.selectedLocation);
  const setPersistedLocation = useMainMapLocationStore((state) => state.setSelectedLocation);

  const manualConfirmTimerRef = useRef<number | null>(null);
  const addressRequestSeqRef = useRef(0);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const currentLocationSheet = useBottomSheet();

  const [loading, error] = useKakaoLoader({
    appkey: appKey ?? "",
    libraries: ["services"],
  });

  useEffect(() => {
    if (!persistedLocation) return;
    const timer = window.setTimeout(() => {
      setCurrentLocation(persistedLocation);
      setMapCenter(persistedLocation);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [persistedLocation]);

  const clearManualConfirmTimer = () => {
    if (manualConfirmTimerRef.current == null) return;
    window.clearTimeout(manualConfirmTimerRef.current);
    manualConfirmTimerRef.current = null;
  };
  const centerMapOnLocation = useCallback((location: LatLng) => {
    const normalizedLocation = { lat: location.lat, lng: location.lng };
    setMapCenter(normalizedLocation);

    if (!mapRef.current || !window.kakao?.maps?.LatLng) return;
    mapRef.current.setCenter(new window.kakao.maps.LatLng(location.lat, location.lng));
  }, []);

  // 선택한 좌표를 바텀시트에 표시할 도로명/지번/건물명으로 변환
  const lookupAddress = (location: LatLng) => {
    if (typeof window === "undefined" || !window.kakao?.maps?.services) {
      setAddressInfo(null);
      setIsResolvingAddress(false);
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    const requestSeq = addressRequestSeqRef.current + 1;
    addressRequestSeqRef.current = requestSeq;
    setIsResolvingAddress(true);

    const fallbackTimer = window.setTimeout(() => {
      if (addressRequestSeqRef.current !== requestSeq) return;
      setAddressInfo(null);
      setIsResolvingAddress(false);
    }, ADDRESS_LOOKUP_TIMEOUT_MS);

    geocoder.coord2Address(location.lng, location.lat, (result, status) => {
      if (addressRequestSeqRef.current !== requestSeq) return;
      window.clearTimeout(fallbackTimer);

      if (status !== window.kakao.maps.services.Status.OK || !result[0]) {
        setAddressInfo(null);
        setIsResolvingAddress(false);
        return;
      }

      const first = result[0];
      setAddressInfo({
        roadAddress: first.road_address?.address_name ?? "",
        jibunAddress: first.address?.address_name ?? "",
        buildingName: first.road_address?.building_name ?? "",
      });
      setIsResolvingAddress(false);
    });
  };

  // 수동 선택 좌표를 확정하고, 주소를 조회한 뒤 현재 위치 바텀시트를 연다.
  const confirmManualLocation = (location: LatLng) => {
    clearManualConfirmTimer();
    setCurrentLocation(location);
    centerMapOnLocation(location);
    setPersistedLocation(location, "manual");
    setIsManualLocationMode(false);
    currentLocationSheet.open();
    lookupAddress(location);
  };

  // 수동 위치 조정 후 일정 시간 입력이 없으면 자동 확정
  const scheduleManualConfirm = (location: LatLng) => {
    clearManualConfirmTimer();
    manualConfirmTimerRef.current = window.setTimeout(() => {
      confirmManualLocation(location);
    }, MANUAL_CONFIRM_DELAY_MS);
  };

  const handleFindCompanion = () => {
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
  };

  const handleOpenManualLocationSetting = () => {
    clearManualConfirmTimer();
    currentLocationSheet.close();
    setIsManualLocationMode(true);
    setHasManualLocationInteracted(false);
    setManualLocationDraft(mapCenter);
  };

  useEffect(() => {
    // 수동 모드에서 사용자가 아직 조작하지 않았다면 안내 토스트를 유지
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

  useEffect(() => {
    return () => clearManualConfirmTimer();
  }, []);

  useEffect(() => {
    if (!currentLocationSheet.isOpen || !isResolvingAddress) return;
    const watchdog = window.setTimeout(() => {
      setIsResolvingAddress(false);
    }, 6000);

    return () => window.clearTimeout(watchdog);
  }, [currentLocationSheet.isOpen, isResolvingAddress]);

  const handleManualMarkerDragEnd = (marker: kakao.maps.Marker) => {
    const position = marker.getPosition();
    const nextLocation = { lat: position.getLat(), lng: position.getLng() };
    if (!hasManualLocationInteracted) {
      setHasManualLocationInteracted(true);
      Toast.hide();
    }
    setManualLocationDraft(nextLocation);
    setCurrentLocation(nextLocation);
    scheduleManualConfirm(nextLocation);
  };

  // 수동 모드에서는 지도 탭 위치로 후보 마커 좌표를 갱신한다.
  const handleManualMapClick = (_map: kakao.maps.Map, mouseEvent: kakao.maps.event.MouseEvent) => {
    if (!isManualLocationMode) return;
    const clicked = mouseEvent.latLng;
    const nextLocation = { lat: clicked.getLat(), lng: clicked.getLng() };
    if (!hasManualLocationInteracted) {
      setHasManualLocationInteracted(true);
      Toast.hide();
    }
    setManualLocationDraft(nextLocation);
    setCurrentLocation(nextLocation);
    scheduleManualConfirm(nextLocation);
  };

  const handleResolveLocation = (location: LatLng) => {
    clearManualConfirmTimer();
    setCurrentLocation(location);
    centerMapOnLocation(location);
    setPersistedLocation(location, "shared");
    lookupAddress(location);
  };

  useEffect(() => {
    if (!currentLocationSheet.isOpen || !currentLocation) return;
    centerMapOnLocation(currentLocation);
  }, [currentLocationSheet.isOpen, currentLocation, centerMapOnLocation]);

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
    <div className="relative h-full">
      <Map
        center={mapCenter}
        level={3}
        draggable
        onCreate={(map) => {
          mapRef.current = map;
        }}
        onClick={handleManualMapClick}
        style={{ width: "100%", height: "100%" }}
      >
        {currentLocation ? <MapMarker position={currentLocation} image={PIN_ME} /> : null}
        {isManualLocationMode ? (
          <MapMarker
            position={manualLocationDraft}
            image={PIN_ME}
            draggable
            onDragEnd={handleManualMarkerDragEnd}
          />
        ) : null}
      </Map>

      {!isManualLocationMode ? (
        <ExpandableFab
          onFindCompanion={handleFindCompanion}
          onOpenManualLocationSetting={handleOpenManualLocationSetting}
          onResolveLocation={handleResolveLocation}
        />
      ) : null}

      <BottomSheet
        key={currentLocationSheet.key}
        isOpen={currentLocationSheet.isOpen}
        onClose={() => {}}
        backdropClick="collapse"
        draggable
        onSnapChange={(snapState) => {
          if (snapState !== "full" || !currentLocation) return;
          centerMapOnLocation(currentLocation);
        }}
        header={
          <div className="flex flex-row items-center gap-2 px-4 pt-2 pb-4">
            <MapPin />
            <div className="text-heading-2 font-bold text-gray-900">현재 내 위치</div>
          </div>
        }
        renderContent={
          <div className="space-y-2">
            {isResolvingAddress ? (
              <p className="text-body-2 text-gray-700">주소를 불러오는 중...</p>
            ) : (
              <>
                {addressInfo?.roadAddress ? (
                  <p className="text-body-2 text-gray-700">도로명: {addressInfo.roadAddress}</p>
                ) : null}
                {addressInfo?.jibunAddress ? (
                  <p className="text-body-2 text-gray-700">지번: {addressInfo.jibunAddress}</p>
                ) : null}
                {addressInfo?.buildingName ? (
                  <p className="text-body-2 text-gray-700">건물명: {addressInfo.buildingName}</p>
                ) : null}
                {!addressInfo?.roadAddress &&
                !addressInfo?.jibunAddress &&
                !addressInfo?.buildingName ? (
                  <p className="text-body-2 text-gray-700">주소 정보를 찾을 수 없어요.</p>
                ) : null}
              </>
            )}
          </div>
        }
      />
    </div>
  );
}
