import { apiClient } from "@/api/client";

import type { PatchUserConsentsRequest, UserConsentResponse } from "./consent.type";

/** consent API 공통 응답 래퍼 */
interface ConsentApiResponse {
  success: boolean;
  message?: string;
  code?: string;
  data: UserConsentResponse;
}

/** 본인의 위치 공유 알림 설정을 수정합니다. */
export async function patchUserConsentsApi(
  payload: PatchUserConsentsRequest
): Promise<UserConsentResponse> {
  const response = await apiClient.patch<ConsentApiResponse>("/api/v1/consents", payload);
  return response.data.data;
}
