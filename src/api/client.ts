import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "@/store/auth/auth.store";

const isMockMode = import.meta.env.VITE_MSW_ENABLED === "true";

export const apiClient = axios.create({
  baseURL: isMockMode ? "" : import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

type AccessTokenPayload = {
  accessToken: string;
};

function getStringCandidate(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function extractAccessToken(source: unknown): AccessTokenPayload | null {
  if (!source || typeof source !== "object") {
    return null;
  }

  const payload = source as Record<string, unknown>;
  const data = (payload.data as Record<string, unknown> | undefined) ?? payload;
  const token = (data.token as Record<string, unknown> | undefined) ?? undefined;
  const tokens = (data.tokens as Record<string, unknown> | undefined) ?? undefined;

  const accessToken =
    getStringCandidate(data.accessToken) ??
    getStringCandidate(data.access_token) ??
    getStringCandidate(token?.accessToken) ??
    getStringCandidate(token?.access_token) ??
    getStringCandidate(tokens?.accessToken) ??
    getStringCandidate(tokens?.access_token);

  if (!accessToken) {
    return null;
  }

  return { accessToken };
}

export function getAccessToken(): string | null {
  return (
    useAuthStore.getState().accessToken ??
    (typeof window !== "undefined" ? localStorage.getItem("access_token") : null)
  );
}

export async function refreshAccessToken(): Promise<string> {
  const response = await axios.post(
    `${isMockMode ? "" : import.meta.env.VITE_API_BASE_URL}/api/v1/auth/refresh`,
    null,
    {
      withCredentials: true,
    }
  );

  const tokenPayload = extractAccessToken(response.data);
  if (!tokenPayload) {
    throw new Error("Invalid refresh response.");
  }

  useAuthStore.getState().setAuthTokens(tokenPayload);
  return tokenPayload.accessToken;
}

let isUnauthorizedHandling = false;
let refreshTokenRequest: Promise<string> | null = null;

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

function shouldAttachAuthorization(url?: string) {
  if (!url) {
    return true;
  }

  return !url.includes("/api/v1/auth/login/kakao");
}

apiClient.interceptors.request.use((config) => {
  const accessToken =
    useAuthStore.getState().accessToken ??
    (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);

  if (!accessToken || !shouldAttachAuthorization(config.url)) {
    return config;
  }

  const headers = AxiosHeaders.from(config.headers);
  if (!headers.get("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  config.headers = headers;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isUnauthorized = error.response?.status === 401;

    if (isUnauthorized && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        refreshTokenRequest ??= refreshAccessToken().finally(() => {
          refreshTokenRequest = null;
        });

        const nextAccessToken = await refreshTokenRequest;
        const headers = AxiosHeaders.from(originalRequest.headers);
        headers.set("Authorization", `Bearer ${nextAccessToken}`);
        originalRequest.headers = headers;

        return apiClient(originalRequest);
      } catch {
        if (!isUnauthorizedHandling) {
          isUnauthorizedHandling = true;
          useAuthStore.getState().clearAuth();

          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.replace("/login");
          }

          setTimeout(() => {
            isUnauthorizedHandling = false;
          }, 0);
        }
      }
    }

    return Promise.reject(error);
  }
);
