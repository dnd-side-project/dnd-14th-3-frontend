import axios, { AxiosHeaders } from "axios";

import { useAuthStore } from "@/store/auth/auth.store";

const isMockMode = import.meta.env.VITE_MSW_ENABLED === "true";

export const apiClient = axios.create({
  baseURL: isMockMode ? "" : import.meta.env.VITE_API_BASE_URL,
});

let isUnauthorizedHandling = false;

apiClient.interceptors.request.use((config) => {
  const accessToken =
    useAuthStore.getState().accessToken ??
    (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);

  if (!accessToken) {
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
  (error) => {
    if (error?.response?.status === 401 && !isUnauthorizedHandling) {
      isUnauthorizedHandling = true;
      useAuthStore.getState().clearAuth();

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.replace("/login");
      }

      setTimeout(() => {
        isUnauthorizedHandling = false;
      }, 0);
    }

    return Promise.reject(error);
  }
);
