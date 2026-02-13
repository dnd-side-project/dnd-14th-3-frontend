import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  clearAccessToken: () => void;
};

const ACCESS_TOKEN_KEY = "access_token";

function getInitialAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function persistAccessToken(accessToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

function clearPersistedAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getInitialAccessToken(),
  setAccessToken: (accessToken) => {
    persistAccessToken(accessToken);
    set({ accessToken });
  },
  clearAccessToken: () => {
    clearPersistedAccessToken();
    set({ accessToken: null });
  },
}));

