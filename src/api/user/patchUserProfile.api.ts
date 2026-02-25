import { logger } from "@/lib/shared/logger";

import { apiClient } from "@/api/client";

import type { PatchUserProfileRequest , UserProfileResponse } from "./userProfile.type";

/** 본인 프로필을 수정합니다. */
export async function patchUserProfileApi(
  userId: string | null,
  payload: PatchUserProfileRequest
): Promise<UserProfileResponse> {
  if (!userId) {
    logger.error(new Error("User ID is required"), { scope: "user-api" });
    throw new Error("User ID is required");
  }
  const response = await apiClient.patch<UserProfileResponse>(`/api/v1/users/${userId}/profiles`, payload);
  return response.data;
}
