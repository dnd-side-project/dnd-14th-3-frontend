import type { ShootingStyle } from "@/types/on-board";

import { PHOTO_STYLE_LABEL_MAP } from "@/constants/on-board/profile-setup/shooting-style";

import { apiClient } from "@/api/client";

interface PhotoStyleItem {
  id: number;
  name?: string;
  label?: string;
}

export interface ShootingStylesApiResponse {
  success: boolean;
  message: string;
  code: string;
  data: PhotoStyleItem[];
}

export async function fetchShootingStylesApi(): Promise<ShootingStyle[]> {
  const response = await apiClient.get<ShootingStylesApiResponse>("/api/v1/photo-style");

  return response.data.data
    .map((style) => style.name ?? style.label ?? "")
    .filter((styleName): styleName is string => styleName.length > 0)
    .map((styleName) => ({
      // signup payload는 스타일 영문 코드 배열을 요구한다.
      id: styleName,
      label: PHOTO_STYLE_LABEL_MAP[styleName] ?? styleName,
    }));
}
