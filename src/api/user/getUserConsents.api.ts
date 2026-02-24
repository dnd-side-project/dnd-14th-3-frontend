import { logger } from "@/lib/shared/logger";

import { apiClient } from "@/api/client";

import type { UserConsentResponse } from "./consent.type";

/** 본인의 위치 공유 알림 설정을 조회합니다. */
export async function getUserConsentsApi(userId: string | null): Promise<UserConsentResponse> {
  if (!userId) {
    logger.error(new Error("User ID is required"), { scope: "user-api" });
    throw new Error("User ID is required");
  }
  const response = await apiClient.get<UserConsentResponse>(`/api/v1/users/${userId}/consents`);
  return response.data;
}
