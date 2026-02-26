import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { logger } from "@/lib/shared/logger";

import { useAuthStore } from "@/store/auth/auth.store";

type JwtPayload = { exp?: number | string };

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const exp = decoded.exp;
    const expNumber =
      typeof exp === "number" ? exp : typeof exp === "string" ? Number(exp) : Number.NaN;
    if (!Number.isFinite(expNumber)) return true;
    return Date.now() >= expNumber * 1000;
  } catch {
    return true;
  }
}

export default function ProtectedRoute() {
  const isMockMode = import.meta.env.VITE_MSW_ENABLED === "true";
  const location = useLocation();
  const { accessToken, clearAuth } = useAuthStore();
  const persistedAccessToken =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const hasTokenMismatch = Boolean(accessToken) && !persistedAccessToken;
  const hasExpiredToken = isMockMode ? false : accessToken ? isTokenExpired(accessToken) : false;

  useEffect(() => {
    logger.info("[ProtectedRoute] auth check", {
      path: location.pathname,
      hasAccessToken: Boolean(accessToken),
      hasPersistedAccessToken: Boolean(persistedAccessToken),
      hasTokenMismatch,
      hasExpiredToken,
    });

    if (hasTokenMismatch || hasExpiredToken) {
      logger.warn("[ProtectedRoute] clearing auth state", {
        reason: hasExpiredToken ? "token-expired" : "token-mismatch",
        path: location.pathname,
      });
      clearAuth();
    }
  }, [
    accessToken,
    clearAuth,
    hasExpiredToken,
    hasTokenMismatch,
    location.pathname,
    persistedAccessToken,
  ]);

  if (!accessToken || hasTokenMismatch || hasExpiredToken) {
    logger.info("[ProtectedRoute] redirect to /login", {
      reason: !accessToken
        ? "missing-access-token"
        : hasTokenMismatch
          ? "token-mismatch"
          : "token-expired",
      from: location.pathname,
    });
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
