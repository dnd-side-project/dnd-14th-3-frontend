import { useEffect } from "react";
import { Navigate, Outlet, useSearchParams } from "react-router-dom";

import { getOnboardingStep } from "@/lib/on-board";

import { useAuthStore } from "@/store/auth/auth.store";

export default function OnboardingRoute() {
  const { accessToken, registerToken, clearAuth } = useAuthStore();
  const [stepParam,] = useSearchParams();
  const step = getOnboardingStep(stepParam.get("step"));

  const persistedAccessToken =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const hasTokenMismatch = Boolean(accessToken) && !persistedAccessToken;

  useEffect(() => {
    if (hasTokenMismatch) {
      clearAuth();
    }
  }, [clearAuth, hasTokenMismatch]);

  // accessToken 있으면 메인으로 (단, notification 단계는 프로필 완료 직후이므로 허용)
  if (accessToken && !hasTokenMismatch && step !== "notification") {
    return <Navigate to="/" replace />;
  }

  // registerToken도 accessToken도 없으면 로그인으로
  if (!registerToken && !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
