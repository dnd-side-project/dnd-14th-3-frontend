import { logger } from "@/lib/shared/logger";

import { apiClient } from "@/api/client";

import type { UserProfileResponse } from "./userProfile.type";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  code?: string;
  data: T;
}

/** 본인 프로필을 조회합니다. */
export async function getUserProfileApi(userId: string | null): Promise<UserProfileResponse> {
  if (!userId) {
    logger.error(new Error("User ID is required"), { scope: "user-api" });
    throw new Error("User ID is required");
  }
  const response = await apiClient.get<ApiResponse<UserProfileResponse>>(
    `/api/v1/users/${userId}/profiles`
  );
  const body = response.data;
  return body?.data ?? (body as unknown as UserProfileResponse);
}
