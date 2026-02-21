import { MapPin } from "lucide-react";
import { Map, MapMarker } from "react-kakao-maps-sdk";

import { type LatLng, type LocationAddressInfo } from "@/types/main-map/location.type";

import { PIN_ME } from "@/constants/main-map/location.constants";

import { useMainMapLocationStore } from "@/store/main-map/location.store";

import ManualLocationSearchButton from "@/components/main-map/ManualLocationSearchButton";
import ManualLocationSearchOverlay from "@/components/main-map/ManualLocationSearchOverlay";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { Button } from "@/components/shared/button";

interface MainMapViewProps {
  mapCenter: LatLng;
  currentLocation: LatLng | null;
  isManualLocationMode: boolean;
  isManualSearchPage: boolean;
  isSheetOpen: boolean;
  sheetKey: string;
  addressInfo: LocationAddressInfo | null;
  isResolvingAddress: boolean;
  mapHandlers: {
    create: (map: kakao.maps.Map) => void;
    dragEnd: (map: kakao.maps.Map) => void;
    manualClick: (map: kakao.maps.Map, mouseEvent: kakao.maps.event.MouseEvent) => void;
  };
  manualActions: {
    selectSearchLocation: (location: LatLng) => void;
    openSearchPage: () => void;
    confirmLocation: () => void;
  };
  onBottomSheetSnapChange: (snapState: "collapsed" | "full") => void;
}

export default function MainMapView({
  mapCenter,
  currentLocation,
  isManualLocationMode,
  isManualSearchPage,
  isSheetOpen,
  sheetKey,
  addressInfo,
  isResolvingAddress,
  mapHandlers,
  manualActions,
  onBottomSheetSnapChange,
}: MainMapViewProps) {
  const showManualSearchInCurrentLocationSheet =
    useMainMapLocationStore((state) => state.source) === "manual";
  const isCenterPinMode = isManualLocationMode || isSheetOpen;

  return (
    <div className="relative h-full">
      <Map
        center={mapCenter}
        level={3}
        draggable
        onDragEnd={mapHandlers.dragEnd}
        onCreate={mapHandlers.create}
        onClick={mapHandlers.manualClick}
        style={{ width: "100%", height: "100%" }}
      >
        {currentLocation && !isCenterPinMode ? (
          <MapMarker position={currentLocation} image={PIN_ME} />
        ) : null}
      </Map>

      {isCenterPinMode ? (
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-[78%]">
          <img
            src={PIN_ME.src}
            width={PIN_ME.size.width}
            height={PIN_ME.size.height}
            alt=""
            aria-hidden
          />
        </div>
      ) : null}

      {isSheetOpen && !isManualSearchPage ? (
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-[310%]">
          <div className="rounded-md bg-mint-500 px-2 py-1 text-caption-1 text-white shadow-sm">
            내 위치
          </div>
        </div>
      ) : null}

      <ManualLocationSearchOverlay
        isOpen={isManualSearchPage}
        onSelectLocation={manualActions.selectSearchLocation}
      />

      <BottomSheet
        isOpen={isManualLocationMode && !isManualSearchPage}
        onClose={() => {}}
        showBackdrop={false}
        backdropClick="none"
        draggable={false}
        dragToClose={false}
        renderContent={
          <div className="space-y-3">
            <ManualLocationSearchButton onClick={manualActions.openSearchPage} className="mt-2" />
            <Button.Primary
              fullWidth
              onClick={manualActions.confirmLocation}
              disabled={!currentLocation}
            >
              이 위치로 설정
            </Button.Primary>
          </div>
        }
      />

      <BottomSheet
        key={sheetKey}
        isOpen={isSheetOpen && !isManualSearchPage}
        onClose={() => {}}
        showBackdrop={false}
        backdropClick="collapse"
        draggable
        initialSnap={showManualSearchInCurrentLocationSheet ? "full" : "collapsed"}
        onSnapChange={onBottomSheetSnapChange}
        header={
          <div className="flex flex-row items-center gap-2 px-4 pt-2 pb-4">
            <MapPin />
            <div className="text-heading-2 font-bold text-gray-900">현재 내 위치</div>
          </div>
        }
        renderContent={
          <div className="space-y-3">
            {isResolvingAddress ? (
              <p className="text-body-2 text-gray-700">주소를 불러오는 중...</p>
            ) : (
              <>
                {addressInfo?.roadAddress ? (
                  <p className="text-body-2 text-gray-700">도로명 {addressInfo.roadAddress}</p>
                ) : null}
                {addressInfo?.jibunAddress ? (
                  <p className="text-body-2 text-gray-700">지번 {addressInfo.jibunAddress}</p>
                ) : null}
                {addressInfo?.buildingName ? (
                  <p className="text-body-2 text-gray-700">건물명 {addressInfo.buildingName}</p>
                ) : null}
                {!addressInfo?.roadAddress &&
                !addressInfo?.jibunAddress &&
                !addressInfo?.buildingName ? (
                  <p className="text-body-2 text-gray-700">주소 정보를 찾을 수 없어요.</p>
                ) : null}
              </>
            )}
            {showManualSearchInCurrentLocationSheet ? (
              <ManualLocationSearchButton onClick={manualActions.openSearchPage} />
            ) : null}
          </div>
        }
      />
    </div>
  );
}
