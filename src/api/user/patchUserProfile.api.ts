import { logger } from "@/lib/shared/logger";

import { apiClient } from "@/api/client";

import type { PatchUserProfileRequest, UserProfileResponse } from "./userProfile.type";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  code?: string;
  data: T;
}

/** 본인 프로필을 수정합니다. (multipart/form-data) */
export async function patchUserProfileApi(
  userId: string | null,
  payload: PatchUserProfileRequest
): Promise<UserProfileResponse> {
  if (!userId) {
    logger.error(new Error("User ID is required"), { scope: "user-api" });
    throw new Error("User ID is required");
  }

  const formData = new FormData();
  const requestPayload = {
    nickname: payload.nickname,
    gender: payload.gender,
    ageGroup: payload.ageGroup,
    introduction: payload.introduction,
    profileImageUrl: payload.profileImageUrl,
    photoStyles: payload.photoStyles,
  };
  formData.append(
    "request",
    new Blob([JSON.stringify(requestPayload)], { type: "application/json" })
  );
  if (payload.profileImage) {
    const imageBlob = new Blob([payload.profileImage], {
      type: payload.profileImage.type,
    });
    formData.append("image", imageBlob, payload.profileImage.name);
  }

  const response = await apiClient.patch<ApiResponse<UserProfileResponse>>(
    `/api/v1/users/${userId}/profiles`,
    formData
  );
  const body = response.data;
  return body?.data ?? (body as unknown as UserProfileResponse);
}
