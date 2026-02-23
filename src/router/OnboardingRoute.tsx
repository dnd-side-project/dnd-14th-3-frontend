import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/store/auth/auth.store";

export default function OnboardingRoute() {
  const { accessToken, registerToken } = useAuthStore();

  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  if (!registerToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
