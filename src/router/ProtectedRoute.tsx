import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/auth/auth.store";

import { useValidateSessionQuery } from "@/queries/auth/useValidateSessionQuery";

import { LoadingIndicator } from "@/components/shared/loading";

export default function ProtectedRoute() {
  const location = useLocation();
  const { accessToken, clearAuth } = useAuthStore();

  const validateQuery = useValidateSessionQuery({
    accessToken,
  });
  const hasValidationError = validateQuery.isError;

  useEffect(() => {
    if (hasValidationError) {
      clearAuth();
    }
  }, [clearAuth, hasValidationError]);

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (validateQuery.isPending) {
    return (
      <div className="p-4">
        <LoadingIndicator />
      </div>
    );
  }

  if (hasValidationError) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

