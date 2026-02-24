import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/auth/auth.store";

export default function ProtectedRoute() {
  const location = useLocation();
  const { accessToken } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
