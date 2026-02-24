import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/store/auth/auth.store";

export default function OnboardingRoute() {
  const { accessToken, registerToken, clearAuth } = useAuthStore();
  const persistedAccessToken =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const hasTokenMismatch = Boolean(accessToken) && !persistedAccessToken;

  useEffect(() => {
    if (hasTokenMismatch) {
      clearAuth();
    }
  }, [clearAuth, hasTokenMismatch]);

  if (accessToken && !hasTokenMismatch) {
    return <Navigate to="/" replace />;
  }

  if (!registerToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
