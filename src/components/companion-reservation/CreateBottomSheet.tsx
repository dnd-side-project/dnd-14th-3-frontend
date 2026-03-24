import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import { useKakaoLoader } from "react-kakao-maps-sdk";

import {
  useReservationCreateStepStore,
  useReservationFormContext,
} from "@/store/companion-reservation";

import BottomSheet from "../shared/bottom-sheet/BottomSheet";
import { LoadingIndicator } from "../shared/loading";
import {
  CreateBottomSheetHeader,
  CreateBottomSheetLocationAdjustStep,
  CreateBottomSheetLocationSearchStep,
} from "./create-bottom-sheet";

const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;

export default function CreateBottomSheet() {
  const [loading, error] = useKakaoLoader({
    appkey: appKey ?? "",
    libraries: ["services"],
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const isOpen = searchParams.get("mode") === "create";
  const currentStep = useReservationCreateStepStore((s) => s.currentStep);
  const reset = useReservationCreateStepStore((s) => s.reset);
  const { reset: fromReset } = useReservationFormContext();
  const onClose = useCallback(() => {
    setSearchParams({});
    reset();
    fromReset();
  }, [setSearchParams, reset, fromReset]);

  const renderContent = useCallback(() => {
    switch (currentStep) {
      case "location-search":
        return <CreateBottomSheetLocationSearchStep />;
      default:
        return <CreateBottomSheetLocationAdjustStep />;
    }
  }, [currentStep]);

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        initialSnap="full"
        header={() => <CreateBottomSheetHeader onClose={onClose} />}
        renderContent={() => {
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
          return renderContent();
        }}
      />
    </>
  );
}
