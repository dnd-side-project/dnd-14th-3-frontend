import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { logger } from "@/lib/shared/logger";

import { useAuthStore } from "@/store/auth/auth.store";

function parseJwtExp(token: string): number | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded)) as unknown;

    if (!payload || typeof payload !== "object") {
      return null;
    }

    const exp = (payload as Record<string, unknown>).exp;
    if (typeof exp === "number" && Number.isFinite(exp)) {
      return exp;
    }
    if (typeof exp === "string") {
      const parsed = Number(exp);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const exp = parseJwtExp(token);
  if (exp === null) return true;
  return Date.now() >= exp * 1000;
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
