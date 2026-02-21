import { useEffect, useRef, useState } from "react";

import { MapPin, Search, X } from "lucide-react";
import { Map, MapMarker } from "react-kakao-maps-sdk";

import {
  type LatLng,
  type LocationAddressInfo,
  type SearchLocationResult,
} from "@/types/main-map/location.type";

import { PIN_ME } from "@/constants/main-map/location.constants";

import ExpandableFab from "@/components/main-map/ExpandableFab";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { LoadingIndicator } from "@/components/shared/loading";

interface MainMapViewProps {
  mapCenter: LatLng;
  currentLocation: LatLng | null;
  isManualLocationMode: boolean;
  isSheetOpen: boolean;
  sheetKey: string;
  addressInfo: LocationAddressInfo | null;
  isResolvingAddress: boolean;
  onMapCreate: (map: kakao.maps.Map) => void;
  onMapDragEnd: (map: kakao.maps.Map) => void;
  onManualMapClick: (map: kakao.maps.Map, mouseEvent: kakao.maps.event.MouseEvent) => void;
  onSearchLocation: (query: string) => Promise<SearchLocationResult[]>;
  onSelectSearchLocation: (location: LatLng) => void;
  onFindCompanion: () => void;
  onOpenManualLocationSetting: () => void;
  onResolveLocation: (location: LatLng) => void;
  onBottomSheetSnapChange: (snapState: "collapsed" | "full") => void;
}

export default function MainMapView({
  mapCenter,
  currentLocation,
  isManualLocationMode,
  isSheetOpen,
  sheetKey,
  addressInfo,
  isResolvingAddress,
  onMapCreate,
  onMapDragEnd,
  onManualMapClick,
  onSearchLocation,
  onSelectSearchLocation,
  onFindCompanion,
  onOpenManualLocationSetting,
  onResolveLocation,
  onBottomSheetSnapChange,
}: MainMapViewProps) {
  const isCenterPinMode = isManualLocationMode || isSheetOpen;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchLocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRequestSeqRef = useRef(0);

  useEffect(() => {
    if (!isManualLocationMode) return;
    const query = searchQuery.trim();
    if (!query) {
      setIsSearching(false);
      if (searchResults.length > 0) setSearchResults([]);
      return;
    }

    const requestSeq = searchRequestSeqRef.current + 1;
    searchRequestSeqRef.current = requestSeq;

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await onSearchLocation(query);
        if (searchRequestSeqRef.current !== requestSeq) return;
        setSearchResults(results);
      } finally {
        if (searchRequestSeqRef.current === requestSeq) setIsSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [isManualLocationMode, onSearchLocation, searchQuery, searchResults.length]);

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

      {isManualLocationMode ? (
        <div className="absolute inset-0 z-30 bg-white">
          <div className="mx-auto flex h-full w-full flex-col">
            <div className="relative mx-4 mt-6 mb-2">
              <Search
                size={19}
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                placeholder="지역/주소를 검색해주세요"
                className="w-full rounded bg-gray-100 py-4 pr-14 pl-12 text-label-1 text-gray-900 outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  aria-label="검색어 지우기"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="absolute top-1/2 right-4 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-gray-500"
                >
                  <X size={12} className="text-white cursor-pointer" />
                </button>
              ) : null}
            </div>

            {isSearching ? (
              <div className="mt-3 flex justify-center py-2">
                <LoadingIndicator />
              </div>
            ) : (
              <ul className="flex-1 overflow-y-auto bg-white mobile-scroll-container">
                {searchResults.map((result) => (
                  <li key={result.id}>
                    <div
                      className="w-full rounded-xl text-left cursor-pointer"
                      onClick={() => onSelectSearchLocation(result.location)}
                    >
                      <div className="px-6 py-4">
                        <p className="text-body-1 text-mint">{result.title}</p>
                        <p className="mt-1 text-label-2 text-gray-500">{result.address}</p>
                      </div>
                      <hr className="text-gray-200" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}

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
            <div className="text-heading-2 font-bold text-gray-900">현재 선택 위치</div>
          </div>
        }
        renderContent={
          <div className="space-y-2">
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
          </div>
        }
      />
    </div>
  );
}
