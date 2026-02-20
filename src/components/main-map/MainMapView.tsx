import { MapPin } from "lucide-react";
import { Map, MapMarker } from "react-kakao-maps-sdk";

import { type LatLng, type LocationAddressInfo } from "@/types/main-map/location.type";

import { PIN_ME } from "@/constants/main-map/location.constants";

import ExpandableFab from "@/components/main-map/ExpandableFab";
import { BottomSheet } from "@/components/shared/bottom-sheet";

interface MainMapViewProps {
  mapCenter: LatLng;
  currentLocation: LatLng | null;
  manualLocationDraft: LatLng;
  isManualLocationMode: boolean;
  isSheetOpen: boolean;
  sheetKey: string;
  addressInfo: LocationAddressInfo | null;
  isResolvingAddress: boolean;
  onMapCreate: (map: kakao.maps.Map) => void;
  onMapDragEnd: (map: kakao.maps.Map) => void;
  onManualMapClick: (map: kakao.maps.Map, mouseEvent: kakao.maps.event.MouseEvent) => void;
  onManualMarkerDragEnd: (marker: kakao.maps.Marker) => void;
  onCurrentMarkerDragEnd: (marker: kakao.maps.Marker) => void;
  onFindCompanion: () => void;
  onOpenManualLocationSetting: () => void;
  onResolveLocation: (location: LatLng) => void;
  onBottomSheetSnapChange: (snapState: "collapsed" | "full") => void;
}

export default function MainMapView({
  mapCenter,
  currentLocation,
  manualLocationDraft,
  isManualLocationMode,
  isSheetOpen,
  sheetKey,
  addressInfo,
  isResolvingAddress,
  onMapCreate,
  onMapDragEnd,
  onManualMapClick,
  onManualMarkerDragEnd,
  onCurrentMarkerDragEnd,
  onFindCompanion,
  onOpenManualLocationSetting,
  onResolveLocation,
  onBottomSheetSnapChange,
}: MainMapViewProps) {
  return (
    <div className="relative h-full">
      <Map
        center={mapCenter}
        level={3}
        draggable
        onDragEnd={onMapDragEnd}
        onCreate={onMapCreate}
        onClick={onManualMapClick}
        style={{ width: "100%", height: "100%" }}
      >
        {currentLocation && !isManualLocationMode ? (
          <MapMarker
            position={currentLocation}
            image={PIN_ME}
            draggable={isSheetOpen}
            onDragEnd={onCurrentMarkerDragEnd}
          />
        ) : null}
        {isManualLocationMode ? (
          <MapMarker
            position={manualLocationDraft}
            image={PIN_ME}
            draggable
            onDragEnd={onManualMarkerDragEnd}
          />
        ) : null}
      </Map>

      {!isManualLocationMode ? (
        <ExpandableFab
          onFindCompanion={onFindCompanion}
          onOpenManualLocationSetting={onOpenManualLocationSetting}
          onResolveLocation={onResolveLocation}
        />
      ) : null}

      <BottomSheet
        key={sheetKey}
        isOpen={isSheetOpen}
        onClose={() => {}}
        showBackdrop={false}
        backdropClick="collapse"
        draggable
        onSnapChange={onBottomSheetSnapChange}
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
