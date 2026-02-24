import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/auth/auth.store";

export default function ProtectedRoute() {
  const location = useLocation();
  const { accessToken, clearAuth } = useAuthStore();
  const persistedAccessToken =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const hasTokenMismatch = Boolean(accessToken) && !persistedAccessToken;

  useEffect(() => {
    if (hasTokenMismatch) {
      clearAuth();
    }
  }, [clearAuth, hasTokenMismatch]);

  if (!accessToken || hasTokenMismatch) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
