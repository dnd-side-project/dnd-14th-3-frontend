import { Map, MapMarker } from "react-kakao-maps-sdk";

import {
  type LatLng,
  type LocationAddressInfo,
  type MapPhase,
  type MatchExpectedDuration,
} from "@/types/main-map";

import { PIN_MATCHED, PIN_ME, PIN_OTHER } from "@/constants/main-map/location.constants";

import MainMapPhaseOverlays from "@/components/main-map/MainMapPhaseOverlays";
import ManualLocationSearchOverlay from "@/components/main-map/ManualLocationSearchOverlay";

interface MainMapViewProps {
  phase: MapPhase;
  mapCenter: LatLng;
  currentLocation: LatLng | null;
  partnerLocation: LatLng | null;
  meetingLocation: LatLng | null;
  isManualLocationMode: boolean;
  isManualSearchPage: boolean;
  isSheetOpen: boolean;
  sheetKey: string;
  addressInfo: LocationAddressInfo | null;
  isResolvingAddress: boolean;
  showManualSearchInCurrentLocationSheet: boolean;
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
  currentLocationActions: {
    retry: () => void;
    request: () => void;
  };
  companionRequestSheet: {
    isOpen: boolean;
    key: string;
    isSubmitting: boolean;
    hasRequestMessageError: boolean;
    selectedDuration: MatchExpectedDuration | null;
    requestMessage: string;
    close: () => void;
    selectDuration: (duration: MatchExpectedDuration) => void;
    changeMessage: (message: string) => void;
    submit: () => void;
  };
  matchingWaitSheet: {
    isOpen: boolean;
    isCancelling: boolean;
    nearbyWaitingCount: number | null;
    cancel: () => void;
  };
  matchFoundSheet: {
    isOpen: boolean;
    accept: () => void;
    rejectProposal: () => void;
    reject: () => void;
    cancelAndBackToIdle: () => void;
    close: () => void;
  };
  acceptedMatchDetailSheet: {
    isOpen: boolean;
    hasMatchSession: boolean;
    isMoving: boolean;
    isCompletingArrival: boolean;
    proposalRejectedSignal: number;
    partnerProfileText: string;
    partnerExpectedDurationLabel: string;
    partnerRequestMessage: string;
    startMoving: () => void;
    completeArrival: () => void;
    arrivalStatusModal: {
      isOpen: boolean;
      type: "partner-arrived" | "partner-moving";
      title: string;
      content: string;
      close: () => void;
    };
    close: () => void;
  };
  matchExpiredModal: {
    isOpen: boolean;
    expiresAt: string | null;
    retry: () => void;
    pause: () => void;
    close: () => void;
  };
  matchRetryLimitModal: {
    isOpen: boolean;
    reserve: () => void;
    nextTime: () => void;
    close: () => void;
  };
  onBottomSheetSnapChange: (snapState: "collapsed" | "full") => void;
}

export default function MainMapView({
  phase,
  mapCenter,
  currentLocation,
  partnerLocation,
  meetingLocation,
  isManualLocationMode,
  isManualSearchPage,
  isSheetOpen,
  sheetKey,
  addressInfo,
  isResolvingAddress,
  showManualSearchInCurrentLocationSheet,
  mapHandlers,
  manualActions,
  currentLocationActions,
  companionRequestSheet,
  matchingWaitSheet,
  matchFoundSheet,
  acceptedMatchDetailSheet,
  matchExpiredModal,
  matchRetryLimitModal,
  onBottomSheetSnapChange,
}: MainMapViewProps) {
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
        {partnerLocation ? <MapMarker position={partnerLocation} image={PIN_OTHER} /> : null}
        {acceptedMatchDetailSheet.isOpen && meetingLocation ? (
          <MapMarker position={meetingLocation} image={PIN_MATCHED} />
        ) : null}
      </Map>

      {isCenterPinMode ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-[78%]">
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
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-[310%]">
          <div className="rounded-md bg-mint-500 px-2 py-1 text-caption-1 text-white shadow-sm">
            내 위치
          </div>
        </div>
      ) : null}

      <ManualLocationSearchOverlay
        isOpen={isManualSearchPage}
        onSelectLocation={manualActions.selectSearchLocation}
      />

      <MainMapPhaseOverlays
        phase={phase}
        currentLocation={currentLocation}
        isManualLocationMode={isManualLocationMode}
        isManualSearchPage={isManualSearchPage}
        isSheetOpen={isSheetOpen}
        sheetKey={sheetKey}
        addressInfo={addressInfo}
        isResolvingAddress={isResolvingAddress}
        showManualSearchInCurrentLocationSheet={showManualSearchInCurrentLocationSheet}
        manualActions={manualActions}
        currentLocationActions={currentLocationActions}
        companionRequestSheet={companionRequestSheet}
        matchingWaitSheet={matchingWaitSheet}
        matchFoundSheet={matchFoundSheet}
        acceptedMatchDetailSheet={acceptedMatchDetailSheet}
        matchExpiredModal={matchExpiredModal}
        matchRetryLimitModal={matchRetryLimitModal}
        onBottomSheetSnapChange={onBottomSheetSnapChange}
      />
    </div>
  );
}
