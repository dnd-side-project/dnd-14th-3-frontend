import { apiClient } from "@/api/client";

import type { UserProfileResponse } from "./userProfile.type";

interface UserProfileApiResponse {
  success: boolean;
  message?: string;
  code?: string;
  data: UserProfileResponse;
}

/** 본인 프로필을 조회합니다. */
export async function getUserProfileApi(): Promise<UserProfileResponse> {
  const response = await apiClient.get<UserProfileApiResponse>("/api/v1/users/profiles");
  return response.data.data;
}
