import { apiClient } from "@/api/client";

export type SessionUser = {
  id: number;
};

export type KakaoLoginResponse = {
  accessToken: string;
};

export async function loginWithKakaoCodeApi(code: string) {
  const response = await apiClient.post<KakaoLoginResponse>("/auth/kakao/login", {
    code,
  });

  return response.data;
}

export async function validateSessionApi(accessToken: string) {
  const response = await apiClient.get<SessionUser>("/users/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}
