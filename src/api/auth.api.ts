import { z } from "zod";

import { apiClient } from "@/api/client";

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

function getStringCandidate(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function normalizeTokenPair(source: unknown): TokenPair | null {
  if (!source || typeof source !== "object") {
    return null;
  }

  const payload = source as Record<string, unknown>;
  const tokenObject = (payload.token as Record<string, unknown> | undefined) ?? null;
  const tokensObject = (payload.tokens as Record<string, unknown> | undefined) ?? null;

  const accessToken =
    getStringCandidate(payload.accessToken) ??
    getStringCandidate(payload.access_token) ??
    getStringCandidate(tokenObject?.accessToken) ??
    getStringCandidate(tokenObject?.access_token) ??
    getStringCandidate(tokensObject?.accessToken) ??
    getStringCandidate(tokensObject?.access_token);
  const refreshToken =
    getStringCandidate(payload.refreshToken) ??
    getStringCandidate(payload.refresh_token) ??
    getStringCandidate(tokenObject?.refreshToken) ??
    getStringCandidate(tokenObject?.refresh_token) ??
    getStringCandidate(tokensObject?.refreshToken) ??
    getStringCandidate(tokensObject?.refresh_token);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

function normalizeKakaoLoginData(source: unknown) {
  if (!source || typeof source !== "object") {
    return source;
  }

  const payload = source as Record<string, unknown>;
  const isNewUser = payload.isNewUser;

  if (isNewUser === true) {
    const registerToken =
      getStringCandidate(payload.registerToken) ??
      getStringCandidate(payload.register_token) ??
      getStringCandidate((payload.token as Record<string, unknown> | undefined)?.registerToken) ??
      getStringCandidate((payload.token as Record<string, unknown> | undefined)?.register_token);

    return {
      isNewUser: true,
      registerToken,
    };
  }

  if (isNewUser === false) {
    const tokenPair = normalizeTokenPair(source);
    return {
      isNewUser: false,
      accessToken: tokenPair?.accessToken,
      refreshToken: tokenPair?.refreshToken,
    };
  }

  return source;
}

const tokenPairSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

const kakaoLoginDataSchema = z.union([
  z.object({
    isNewUser: z.literal(true),
    registerToken: z.string().min(1),
  }),
  z
    .object({
      isNewUser: z.literal(false),
    })
    .merge(tokenPairSchema),
]);

const kakaoLoginResponseSchema = z
  .object({
    success: z.literal(true),
    message: z.string(),
    code: z.string(),
    data: z.unknown(),
  })
  .transform((response) => ({
    ...response,
    data: kakaoLoginDataSchema.parse(normalizeKakaoLoginData(response.data)),
  }));

const tokenPairResponseSchema = z
  .object({
    success: z.literal(true),
    message: z.string(),
    code: z.string(),
    data: z.unknown(),
  })
  .transform((response) => ({
    ...response,
    data: tokenPairSchema.parse(normalizeTokenPair(response.data)),
  }));

export type KakaoLoginResponse = z.infer<typeof kakaoLoginResponseSchema>;

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

  return kakaoLoginResponseSchema.parse(response.data);
}

export async function signupWithRegisterTokenApi(registerToken: string, payload: SignupRequest) {
  const response = await apiClient.post<SignupResponse>("/api/v1/auth/signup", payload, {
    headers: {
      "Register-Token": registerToken,
    },
  });

  return tokenPairResponseSchema.parse(response.data);
}

export async function refreshTokenApi(refreshToken: string) {
  const response = await apiClient.post<RefreshResponse>("/api/v1/auth/refresh", null, {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  return tokenPairResponseSchema.parse(response.data);
}
