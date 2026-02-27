import { useKakaoLoader } from "react-kakao-maps-sdk";

import { useMainMapController } from "@/hooks/main-map/useMainMapController";

import ExpandableFab from "@/components/main-map/ExpandableFab";
import MainMapView from "@/components/main-map/MainMapView";
import { LoadingIndicator } from "@/components/shared/loading";

export default function MainMapPage() {
  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;

  const [loading, error] = useKakaoLoader({
    appkey: appKey ?? "",
    libraries: ["services"],
  });

  const controller = useMainMapController({ isKakaoReady: !loading && !error });

  if (!appKey) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-center text-body-2 text-warning-700">
          {import.meta.env.DEV
            ? "카카오맵 앱 키가 설정되지 않았어요. `.env`의 `VITE_KAKAO_MAP_APP_KEY`를 확인해 주세요."
            : "불러올 수 없어요. 잠시 후 다시 시도해 주세요."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-center text-body-2 text-warning-700">
          지도를 불러올 수 없어요. 잠시 후 다시 시도해 주세요.
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
        mapCenter={controller.mapCenter}
        currentLocation={controller.currentLocation}
        partnerLocation={controller.partnerLocation}
        meetingLocation={controller.meetingLocation}
        isManualLocationMode={controller.isManualLocationMode}
        isManualSearchPage={controller.isManualSearchPage}
        isSheetOpen={controller.isSheetOpen}
        sheetKey={controller.sheetKey}
        addressInfo={controller.addressInfo}
        isResolvingAddress={controller.isResolvingAddress}
        showManualSearchInCurrentLocationSheet={controller.showManualSearchInCurrentLocationSheet}
        mapHandlers={controller.mapHandlers}
        manualActions={controller.manualActions}
        currentLocationActions={controller.currentLocationActions}
        companionRequestSheet={controller.companionRequestSheet}
        matchingWaitSheet={controller.matchingWaitSheet}
        matchFoundSheet={controller.matchFoundSheet}
        acceptedMatchDetailSheet={controller.acceptedMatchDetailSheet}
        matchExpiredModal={controller.matchExpiredModal}
        matchRetryLimitModal={controller.matchRetryLimitModal}
        onBottomSheetSnapChange={controller.onBottomSheetSnapChange}
      />

      {controller.isFabVisible ? <ExpandableFab actions={controller.expandableFabActions} /> : null}
    </>
  );
}
