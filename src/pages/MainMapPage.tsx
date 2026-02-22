import { useKakaoLoader } from "react-kakao-maps-sdk";

import { useMainMapController } from "@/hooks/main-map/useMainMapController";

import ExpandableFab from "@/components/main-map/ExpandableFab";
import MainMapView from "@/components/main-map/MainMapView";
import { LoadingIndicator } from "@/components/shared/loading";

export default function MainMapPage() {
  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
  const controller = useMainMapController();

  const [loading, error] = useKakaoLoader({
    appkey: appKey ?? "",
    libraries: ["services"],
  });

  if (!appKey) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-center text-body-2 text-warning-700">
          {import.meta.env.DEV
            ? "Kakao map key is not configured. Check VITE_KAKAO_MAP_APP_KEY in .env."
            : "Unable to load. Please try again later."}
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
        mapCenter={controller.mapCenter}
        currentLocation={controller.currentLocation}
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
        onBottomSheetSnapChange={controller.onBottomSheetSnapChange}
      />

      {controller.isFabVisible ? <ExpandableFab actions={controller.expandableFabActions} /> : null}
    </>
  );
}
