import { apiClient } from "@/api/client";

import type { UserConsentResponse } from "./consent.type";

/** consent API 공통 응답 래퍼 */
interface ConsentApiResponse {
  success: boolean;
  message?: string;
  code?: string;
  data: UserConsentResponse;
}

/** 본인의 위치 공유 알림 설정을 조회합니다. */
export async function getUserConsentsApi(): Promise<UserConsentResponse> {
  const response = await apiClient.get<ConsentApiResponse>("/api/v1/consents");
  return response.data.data;
}
