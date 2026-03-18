import { ChevronUp, MapPin, X } from "lucide-react";

import type { LocationAddressInfo, MatchExpectedDuration } from "@/types/main-map";

import ManualLocationSearchButton from "@/components/main-map/ManualLocationSearchButton";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { Button } from "@/components/shared/button";
import { ChipButton } from "@/components/shared/chip-button";
import { TextArea } from "@/components/shared/textarea";

type CompanionRequestSheet = {
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

type LocationPhasePanelsProps = {
  showLocationPanels: boolean;
  showRequestPanel: boolean;
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
  companionRequestSheet: CompanionRequestSheet;
  companionRequestSnapState: "collapsed" | "full";
  onCompanionRequestSnapChange: (snap: "collapsed" | "full") => void;
  onBottomSheetSnapChange: (snap: "collapsed" | "full") => void;
};

export default function LocationPhasePanels({
  showLocationPanels,
  showRequestPanel,
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
  companionRequestSnapState,
  onCompanionRequestSnapChange,
  onBottomSheetSnapChange,
}: LocationPhasePanelsProps) {
  const shouldDisableRequestButton =
    !addressInfo?.roadAddress && !addressInfo?.jibunAddress && !addressInfo?.buildingName;

  return (
    <>
      <BottomSheet
        isOpen={showLocationPanels && isManualLocationMode && !isManualSearchPage}
        onClose={() => {}}
        showBackdrop={false}
        backdropClick="none"
        draggable={false}
        dragToClose={false}
        renderContent={
          <div className="space-y-3">
            <ManualLocationSearchButton onClick={manualActions.openSearchPage} className="mt-2" />
            <Button.Secondary
              fullWidth
              onClick={manualActions.confirmLocation}
              disabled={!currentLocation}
            >
              주소 확정하기
            </Button.Secondary>
          </div>
        }
      />

      <BottomSheet
        key={sheetKey}
        isOpen={showLocationPanels && isSheetOpen && !isManualSearchPage}
        onClose={() => {}}
        showBackdrop={false}
        backdropClick="none"
        draggable={false}
        initialSnap="full"
        onSnapChange={onBottomSheetSnapChange}
        header={
          <div className="flex flex-row items-center gap-2 p-4">
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
                {addressInfo?.buildingName ? (
                  <div className="text-heading-2 font-bold text-gray-900">
                    {addressInfo.buildingName}
                  </div>
                ) : null}
                {addressInfo?.roadAddress ? (
                  <p className="text-body-1 text-gray-600">{addressInfo.roadAddress}</p>
                ) : addressInfo?.jibunAddress ? (
                  <p className="text-body-1 text-gray-600">{addressInfo.jibunAddress}</p>
                ) : null}
                {!addressInfo?.roadAddress &&
                !addressInfo?.jibunAddress &&
                !addressInfo?.buildingName ? (
                  <p className="text-body-1 text-gray-600">주소 정보를 찾을 수 없어요.</p>
                ) : null}
              </>
            )}
            {showManualSearchInCurrentLocationSheet ? (
              <ManualLocationSearchButton onClick={manualActions.openSearchPage} />
            ) : null}
          </div>
        }
        footer={
          <div className="flex items-center gap-4">
            {!showManualSearchInCurrentLocationSheet ? (
              <Button.Secondary fullWidth onClick={currentLocationActions.retry}>
                재시도
              </Button.Secondary>
            ) : null}
            <Button.Primary
              fullWidth
              disabled={shouldDisableRequestButton}
              onClick={currentLocationActions.request}
            >
              요청하기
            </Button.Primary>
          </div>
        }
      />

      <BottomSheet
        key={companionRequestSheet.key}
        isOpen={showRequestPanel && companionRequestSheet.isOpen}
        onClose={companionRequestSheet.close}
        showBackdrop
        backdropClick="none"
        draggable
        dragToClose={false}
        initialSnap="full"
        onSnapChange={onCompanionRequestSnapChange}
        header={(actions) => (
          <div className="flex items-center justify-between gap-2 px-4 pb-4 pt-2">
            <div className="flex flex-row items-center gap-2">
              <MapPin />
              <div className="text-heading-2 font-bold text-gray-900">동행 요청</div>
            </div>
            <button
              type="button"
              aria-label={
                companionRequestSnapState === "collapsed" ? "바텀시트 펼치기" : "바텀시트 접기"
              }
              className="inline-flex size-7 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => {
                if (companionRequestSnapState === "collapsed") {
                  actions.expand();
                  return;
                }
                actions.collapse();
              }}
            >
              {companionRequestSnapState === "collapsed" ? (
                <ChevronUp className="size-5" />
              ) : (
                <X className="size-5" />
              )}
            </button>
          </div>
        )}
        renderContent={
          <div className="h-[64vh] space-y-5 pb-2">
            <section className="space-y-2">
              <h3 className="text-body-1 font-bold text-gray-900">촬영 예상 소요 시간</h3>
              <div className="flex flex-wrap gap-2">
                <ChipButton
                  selected={companionRequestSheet.selectedDuration === "TEN_MINUTES"}
                  onClick={() => companionRequestSheet.selectDuration("TEN_MINUTES")}
                >
                  10분
                </ChipButton>
                <ChipButton
                  selected={companionRequestSheet.selectedDuration === "TWENTY_MINUTES"}
                  onClick={() => companionRequestSheet.selectDuration("TWENTY_MINUTES")}
                >
                  20분
                </ChipButton>
                <ChipButton
                  selected={companionRequestSheet.selectedDuration === "THIRTY_PLUS_MINUTES"}
                  onClick={() => companionRequestSheet.selectDuration("THIRTY_PLUS_MINUTES")}
                >
                  30분 이상
                </ChipButton>
              </div>
            </section>
            <section className="space-y-2">
              <h3 className="text-body-1 font-bold text-gray-900">요청 메시지</h3>
              <TextArea
                value={companionRequestSheet.requestMessage}
                onChange={companionRequestSheet.changeMessage}
                status={companionRequestSheet.hasRequestMessageError ? "error" : "default"}
                placeholder="요청 메시지를 작성해 주세요"
                rows={4}
                maxLength={200}
                caption={`${companionRequestSheet.requestMessage.length}/200`}
              />
            </section>
          </div>
        }
        footer={
          <Button.Primary
            fullWidth
            disabled={!companionRequestSheet.selectedDuration || companionRequestSheet.isSubmitting}
            onClick={companionRequestSheet.submit}
          >
            {companionRequestSheet.isSubmitting ? "요청 중..." : "보내기"}
          </Button.Primary>
        }
      />
    </>
  );
}
