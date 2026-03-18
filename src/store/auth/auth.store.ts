import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  registerToken: string | null;
  isNewUser: boolean;
  setAuthTokens: (tokens: { accessToken: string }) => void;
  setRegisterToken: (registerToken: string) => void;
  clearAuth: () => void;
};

const ACCESS_TOKEN_KEY = "access_token";
const REGISTER_TOKEN_KEY = "register_token";

function getInitialToken(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  if (key === REGISTER_TOKEN_KEY) {
    return sessionStorage.getItem(key);
  }

  return localStorage.getItem(key);
}

function persistToken(key: string, value: string) {
  if (key === REGISTER_TOKEN_KEY) {
    sessionStorage.setItem(key, value);
    return;
  }

  localStorage.setItem(key, value);
}

function clearPersistedTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem("refresh_token");
  sessionStorage.removeItem(REGISTER_TOKEN_KEY);
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getInitialToken(ACCESS_TOKEN_KEY),
  registerToken: getInitialToken(REGISTER_TOKEN_KEY),
  isNewUser: Boolean(getInitialToken(REGISTER_TOKEN_KEY)),
  setAuthTokens: ({ accessToken }) => {
    persistToken(ACCESS_TOKEN_KEY, accessToken);
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem(REGISTER_TOKEN_KEY);
    set({
      accessToken,
      registerToken: null,
      isNewUser: false,
    });
  },
  setRegisterToken: (registerToken) => {
    persistToken(REGISTER_TOKEN_KEY, registerToken);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem("refresh_token");
    set({
      registerToken,
      isNewUser: true,
      accessToken: null,
    });
  },
  clearAuth: () => {
    clearPersistedTokens();
    set({
      accessToken: null,
      registerToken: null,
      isNewUser: false,
    });
  },
}));
