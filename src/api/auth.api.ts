import { z } from "zod";

import { apiClient } from "@/api/client";

type AccessTokenPayload = {
  accessToken: string;
};

type ApiSuccess<T> = {
  success: true;
  message: string;
  code: string | null;
  data: T;
};

function getStringCandidate(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function normalizeAccessToken(source: unknown): AccessTokenPayload | null {
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
  if (!accessToken) {
    return null;
  }

  return { accessToken };
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
      profileImageUrl: getStringCandidate(payload.profileImageUrl) ?? undefined,
    };
  }

  if (isNewUser === false) {
    const accessTokenPayload = normalizeAccessToken(source);
    return {
      isNewUser: false,
      accessToken: accessTokenPayload?.accessToken,
    };
  }

  return source;
}

const accessTokenSchema = z.object({
  accessToken: z.string().min(1),
});

const kakaoLoginDataSchema = z.union([
  z.object({
    isNewUser: z.literal(true),
    registerToken: z.string().min(1),
    profileImageUrl: z.string().optional(),
  }),
  z
    .object({
      isNewUser: z.literal(false),
    })
    .merge(accessTokenSchema),
]);

const kakaoLoginResponseSchema = z
  .object({
    success: z.literal(true),
    message: z.string(),
    code: z.string().nullable(),
    data: z.unknown(),
  })
  .transform((response) => ({
    ...response,
    data: kakaoLoginDataSchema.parse(normalizeKakaoLoginData(response.data)),
  }));

const accessTokenResponseSchema = z
  .object({
    success: z.literal(true),
    message: z.string(),
    code: z.string().nullable(),
    data: z.unknown(),
  })
  .transform((response) => ({
    ...response,
    data: accessTokenSchema.parse(normalizeAccessToken(response.data)),
  }));

const verifySessionResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  code: z.string().nullable(),
  data: z.string(),
});

export type KakaoLoginResponse = z.infer<typeof kakaoLoginResponseSchema>;

export type SignupRequest = {
  nickname: string;
  gender: string;
  ageGroup: string;
  introduction: string;
  profileImageUrl?: string;
  photoStyles: string[];
};

export type SignupResponse = ApiSuccess<AccessTokenPayload>;

export type RefreshResponse = ApiSuccess<AccessTokenPayload>;
export type VerifySessionResponse = ApiSuccess<string>;

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

  return accessTokenResponseSchema.parse(response.data);
}

export async function refreshTokenApi() {
  const response = await apiClient.post<RefreshResponse>("/api/v1/auth/refresh");

  return accessTokenResponseSchema.parse(response.data);
}

export async function verifySessionApi() {
  const response = await apiClient.get<VerifySessionResponse>("/api/v1/auth/verify");
  return verifySessionResponseSchema.parse(response.data);
}
