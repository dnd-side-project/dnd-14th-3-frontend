import { jwtDecode } from "jwt-decode";

import { useAuthStore } from "@/store/auth/auth.store";

interface DecodedToken {
  sub: string;
}

export function getUserIdFromToken(): string | null {
  const accessToken = useAuthStore.getState().accessToken || localStorage.getItem("access_token");
  if (!accessToken) {
    return null;
  }
  const decoded = jwtDecode<DecodedToken>(accessToken);
  return decoded.sub ?? null;
}
