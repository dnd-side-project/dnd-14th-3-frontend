import { apiClient } from "@/api/client";

export type SessionUser = {
  id: number;
};

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

type ApiSuccess<T> = {
  success: true;
  message: string;
  code: string;
  data: T;
};

export type KakaoLoginResponse = ApiSuccess<
  | {
      isNewUser: false;
    } & TokenPair
  | {
      isNewUser: true;
      registerToken: string;
    }
>;

export type SignupRequest = {
  nickname: string;
  gender: string;
  profileImageUrl: string;
  photoStyles: string[];
};

export type SignupResponse = ApiSuccess<TokenPair>;

export type RefreshResponse = ApiSuccess<TokenPair>;

export async function loginWithKakaoCodeApi(code: string) {
  const response = await apiClient.get<KakaoLoginResponse>("/api/v1/auth/login/kakao", {
    params: { code },
  });

  return response.data;
}

export async function signupWithRegisterTokenApi(registerToken: string, payload: SignupRequest) {
  const response = await apiClient.post<SignupResponse>("/api/v1/auth/signup", payload, {
    headers: {
      "Register-Token": registerToken,
    },
  });

  return response.data;
}

export async function refreshTokenApi(refreshToken: string) {
  const response = await apiClient.post<RefreshResponse>("/api/v1/auth/refresh", null, {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
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

