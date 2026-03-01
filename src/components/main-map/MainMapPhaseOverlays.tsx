import { useState } from "react";

import type { LocationAddressInfo, MapPhase, MatchExpectedDuration } from "@/types/main-map";

import LocationPhasePanels from "@/components/main-map/phase-overlays/LocationPhasePanels";
import MatchingPhasePanels from "@/components/main-map/phase-overlays/MatchingPhasePanels";
import SessionPhasePanels from "@/components/main-map/phase-overlays/SessionPhasePanels";
import { Popup } from "@/components/shared/popup";

type MainMapPhaseOverlaysProps = {
  phase: MapPhase;
  currentLocation: { lat: number; lng: number } | null;
  isManualLocationMode: boolean;
  isManualSearchPage: boolean;
  isSheetOpen: boolean;
  sheetKey: string;
  addressInfo: LocationAddressInfo | null;
  isResolvingAddress: boolean;
  showManualSearchInCurrentLocationSheet: boolean;
  manualActions: {
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
    movingSheetTitle: string;
    proposalRejectedSignal: number;
    isLocationShareDisconnected: boolean;
    partnerProfileText: string;
    partnerExpectedDurationLabel: string;
    partnerRequestMessage: string;
    startMoving: () => void;
    retryLocationShare: () => void;
    openDirections: () => void;
    completeArrival: () => void;
    arrivalStatusModal: {
      isOpen: boolean;
      type: "partner-arrived" | "partner-moving";
      title: string;
      content: string;
      close: () => void;
      confirm: () => void;
    };
    meetingStartedModal: {
      isOpen: boolean;
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
};

export default function MainMapPhaseOverlays({
  phase,
  currentLocation,
  isManualLocationMode,
  isManualSearchPage,
  isSheetOpen,
  sheetKey,
  addressInfo,
  isResolvingAddress,
  showManualSearchInCurrentLocationSheet,
  manualActions,
  currentLocationActions,
  companionRequestSheet,
  matchingWaitSheet,
  matchFoundSheet,
  acceptedMatchDetailSheet,
  matchExpiredModal,
  matchRetryLimitModal,
  onBottomSheetSnapChange,
}: MainMapPhaseOverlaysProps) {
  const [companionRequestSnapState, setCompanionRequestSnapState] = useState<"collapsed" | "full">(
    "full"
  );
  const [movingSheetSnapState, setMovingSheetSnapState] = useState<"collapsed" | "full">("full");
  const [manualRejectConfirmModalOpen, setManualRejectConfirmModalOpen] = useState(false);
  const [dismissedRejectedSignal, setDismissedRejectedSignal] = useState(0);

  const isPeerRejectedFlow =
    acceptedMatchDetailSheet.proposalRejectedSignal > dismissedRejectedSignal;
  const isRejectConfirmModalOpen = manualRejectConfirmModalOpen || isPeerRejectedFlow;

  const handleManualRejectRequested = () => {
    matchFoundSheet.rejectProposal();
    setManualRejectConfirmModalOpen(true);
  };

  return (
    <>
      <LocationPhasePanels
        showLocationPanels={phase === "manual-location-setting" || phase === "location-setting"}
        showRequestPanel={phase === "requesting-companion"}
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
        companionRequestSnapState={companionRequestSnapState}
        onCompanionRequestSnapChange={setCompanionRequestSnapState}
        onBottomSheetSnapChange={onBottomSheetSnapChange}
      />

      <MatchingPhasePanels
        showMatchingPhase={phase === "matching-in-progress"}
        showMatchSuccessPhase={phase === "match-success"}
        isPeerRejectedFlow={isPeerRejectedFlow}
        matchingWaitSheet={matchingWaitSheet}
        matchFoundSheet={matchFoundSheet}
        onManualRejectRequested={handleManualRejectRequested}
      />

      <Popup
        isOpen={isRejectConfirmModalOpen}
        title="다른 메이트를 찾아볼까요?"
        content={
          isPeerRejectedFlow
            ? "상대방이 매칭을 거절했어요\n다른 메이트를 찾아볼까요?"
            : "현재 매칭을 취소하고\n다른 메이트를 찾을 수 있어요."
        }
        confirmMessage="새로운 동행 찾기"
        cancelMessage="다음에 다시 찾기"
        onClose={() => {
          if (isPeerRejectedFlow) {
            setDismissedRejectedSignal(acceptedMatchDetailSheet.proposalRejectedSignal);
          }
          setManualRejectConfirmModalOpen(false);
        }}
        onConfirm={() => {
          if (isPeerRejectedFlow) {
            setDismissedRejectedSignal(acceptedMatchDetailSheet.proposalRejectedSignal);
          }
          setManualRejectConfirmModalOpen(false);
          matchFoundSheet.reject();
        }}
        onCancel={() => {
          if (isPeerRejectedFlow) {
            setDismissedRejectedSignal(acceptedMatchDetailSheet.proposalRejectedSignal);
          }
          setManualRejectConfirmModalOpen(false);
          matchFoundSheet.cancelAndBackToIdle();
        }}
      />

      <SessionPhasePanels
        showAcceptedPhase={phase === "match-accepted"}
        showMovingPhase={
          phase === "moving" || phase === "arrival-pending" || phase === "meeting-started"
        }
        showFailedPhase={phase === "match-failed"}
        isPeerRejectedFlow={isPeerRejectedFlow}
        acceptedMatchDetailSheet={acceptedMatchDetailSheet}
        matchExpiredModal={matchExpiredModal}
        matchRetryLimitModal={matchRetryLimitModal}
        movingSheetSnapState={movingSheetSnapState}
        onMovingSheetSnapChange={setMovingSheetSnapState}
        onManualRejectRequested={handleManualRejectRequested}
      />
    </>
  );
}
