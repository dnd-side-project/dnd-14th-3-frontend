import { logger } from "@/lib/shared/logger";

import { apiClient } from "@/api/client";

import type { PatchUserConsentsRequest, UserConsentResponse } from "./consent.type";

/** 본인의 위치 공유 알림 설정을 수정합니다. */
export async function patchUserConsentsApi(
  userId: string | null,
  payload: PatchUserConsentsRequest
): Promise<UserConsentResponse> {
  if (!userId) {
    logger.error(new Error("User ID is required"), { scope: "user-api" });
    throw new Error("User ID is required");
  }
  const response = await apiClient.patch<UserConsentResponse>(`/api/v1/users/${userId}/consents`, payload);
  return response.data;
}
