import { Gender } from "@/types/on-board";

import { apiClient } from "@/api/client";

export interface SignupRequest {
  nickname: string;
  gender: Gender;
  profileImageUrl?: string;
  photoStyles: string[];
}

interface SignupApiResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    accessToken: string;
    refreshToken?: string;
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
