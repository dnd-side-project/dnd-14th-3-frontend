import { jwtDecode } from "jwt-decode";

import { logger } from "@/lib/shared/logger";

import { useAuthStore } from "@/store/auth/auth.store";

interface DecodedToken {
  sub: string;
}

export function getUserIdFromToken(): string | null {
  const accessToken = useAuthStore.getState().accessToken || localStorage.getItem("access_token");
  if (!accessToken) {
    return null;
  }
  try {
    const decoded = jwtDecode<DecodedToken>(accessToken);
    return decoded.sub ?? null;
  } catch (error) {
    logger.error(error, { scope: "getUserIdFromToken" });
    return null;
  }
}
