import { Map, useKakaoLoader } from "react-kakao-maps-sdk";

import { LoadingIndicator } from "@/components/shared/loading";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export default function MainMapPage() {
  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;

  const [loading, error] = useKakaoLoader({
    appkey: appKey ?? "",
  });

  if (!appKey) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-center text-body-2 text-warning-700">
          {import.meta.env.DEV
            ? "카카오맵 키가 설정되지 않았습니다. .env의 VITE_KAKAO_MAP_APP_KEY를 확인해주세요."
            : "지도를 불러올 수 없습니다. 잠시 후 다시 시도해주세요."}
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

  return <Map center={DEFAULT_CENTER} level={3} draggable style={{ width: "100%", height: "100%" }} />;
}
