import type { AgeRange, Gender } from "@/types/profile";

import { apiClient } from "@/api/client";

export interface SignupRequest {
  nickname: string;
  gender: Gender;
  ageGroup: AgeRange;
  introduction: string;
  profileImageUrl?: string;
  photoStyles: string[];
}

interface SignupApiResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    accessToken: string;
  };
}

export async function signUpApi(token: string, data: SignupRequest): Promise<SignupApiResponse> {
  const response = await apiClient.post("/api/v1/auth/signup", data, {
    headers: {
      "Content-Type": "application/json",
      "Register-Token": token,
    },
  });
  return response.data;
}
