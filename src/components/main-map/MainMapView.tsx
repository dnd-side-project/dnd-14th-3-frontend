import { useState } from "react";

import { ChevronUp, MapPin, X } from "lucide-react";
import { Map, MapMarker } from "react-kakao-maps-sdk";

import { type LatLng, type LocationAddressInfo } from "@/types/main-map/location.type";
import { type MatchExpectedDuration } from "@/types/main-map/match-request.type";

import { PIN_ME } from "@/constants/main-map/location.constants";

import ManualLocationSearchButton from "@/components/main-map/ManualLocationSearchButton";
import ManualLocationSearchOverlay from "@/components/main-map/ManualLocationSearchOverlay";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { Button } from "@/components/shared/button";
import { ChipButton } from "@/components/shared/chip-button";
import { TextArea } from "@/components/shared/textarea";

interface MainMapViewProps {
  mapCenter: LatLng;
  currentLocation: LatLng | null;
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
    cancel: () => void;
  };
  matchFoundSheet: {
    isOpen: boolean;
    close: () => void;
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
  showManualSearchInCurrentLocationSheet,
  mapHandlers,
  manualActions,
  currentLocationActions,
  companionRequestSheet,
  matchingWaitSheet,
  matchFoundSheet,
  onBottomSheetSnapChange,
}: MainMapViewProps) {
  const [companionRequestSnapState, setCompanionRequestSnapState] = useState<"collapsed" | "full">(
    "full"
  );
  const [matchFoundSnapState, setMatchFoundSnapState] = useState<"collapsed" | "full">("full");

  const isCenterPinMode = isManualLocationMode || isSheetOpen;
  const shouldDisableRequestButton =
    !addressInfo?.roadAddress && !addressInfo?.jibunAddress && !addressInfo?.buildingName;

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
        isOpen={isSheetOpen && !isManualSearchPage}
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
        isOpen={companionRequestSheet.isOpen}
        onClose={companionRequestSheet.close}
        showBackdrop
        backdropClick="none"
        draggable
        dragToClose={false}
        initialSnap="full"
        onSnapChange={setCompanionRequestSnapState}
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
                  selected={companionRequestSheet.selectedDuration === "OVER_THIRTY_MINUTES"}
                  onClick={() => companionRequestSheet.selectDuration("OVER_THIRTY_MINUTES")}
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

      <BottomSheet
        isOpen={matchingWaitSheet.isOpen}
        onClose={() => {}}
        showBackdrop
        backdropClick="none"
        draggable={false}
        dragToClose={false}
        initialSnap="full"
        renderContent={
          <div className="space-y-1 pt-2">
            <p className="text-gray-500 text-body-2">500m 이내</p>
            <p className="text-heading-2 font-bold mb-3">오늘의 사진 메이트를 찾고 있어요</p>
            <p className="text-body-1 text-gray-500">
              실시간으로 주변 사용자를 찾는 중입니다. 잠시만 기다려 주세요.
            </p>
          </div>
        }
        footer={
          <Button.Secondary
            fullWidth
            disabled={matchingWaitSheet.isCancelling}
            onClick={matchingWaitSheet.cancel}
          >
            {matchingWaitSheet.isCancelling ? "요청 취소 중..." : "요청 취소"}
          </Button.Secondary>
        }
      />

      <BottomSheet
        isOpen={matchFoundSheet.isOpen}
        onClose={matchFoundSheet.close}
        showBackdrop
        backdropClick="none"
        draggable
        dragToClose={false}
        initialSnap="full"
        onSnapChange={setMatchFoundSnapState}
        header={(actions) => (
          <div className="flex items-center justify-between gap-2 px-4 pb-4 pt-2">
            <div className="flex flex-row items-center gap-2">
              <MapPin />
              <div className="text-heading-2 font-bold text-gray-900">사진 메이트를 찾았어요</div>
            </div>
            <button
              type="button"
              aria-label={
                matchFoundSnapState === "collapsed" ? "바텀시트 펼치기" : "바텀시트 접기"
              }
              className="inline-flex size-7 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => {
                if (matchFoundSnapState === "collapsed") {
                  actions.expand();
                  return;
                }
                actions.collapse();
              }}
            >
              {matchFoundSnapState === "collapsed" ? (
                <ChevronUp className="size-5" />
              ) : (
                <X className="size-5" />
              )}
            </button>
          </div>
        )}
        renderContent={
          <div className="text-gray-500 text-body-2">
            매칭 후 15분 이내에 이동을 시작해주세요.
            <br />
            늦을 경우 매칭이 자동 취소될 수 있어요.
          </div>
        }
        footer={
          <Button.Primary fullWidth onClick={matchFoundSheet.close}>
            매칭 수락
          </Button.Primary>
        }
      />
    </div>
  );
}
