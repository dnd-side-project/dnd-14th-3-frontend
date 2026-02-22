import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { type AxiosError } from "axios";

import { logger } from "@/lib/shared/logger";

import { loginWithKakaoCodeApi } from "@/api/auth.api";

import { useAuthStore } from "@/store/auth/auth.store";

function isSafeRedirectPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

function toErrorLogPayload(error: unknown) {
  const axiosError = error as AxiosError;
  return {
    message: axiosError?.message ?? "Unknown error",
    status: axiosError?.response?.status,
    data: axiosError?.response?.data,
  };
}

export default function KakaoCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const redirectPath = state && isSafeRedirectPath(state) ? state : "/";

    logger.info("[Auth] Kakao callback received.", {
      hasCode: Boolean(code),
      state,
      redirectPath,
      href: window.location.href,
    });

    if (!code) {
      logger.warn("[Auth] Missing code in callback query params.");
      navigate("/login", { replace: true });
      return;
    }

    loginWithKakaoCodeApi(code)
      .then(({ accessToken }) => {
        logger.info("[Auth] Token exchange succeeded.", {
          tokenLength: accessToken.length,
          redirectPath,
        });
        setAccessToken(accessToken);
        navigate(redirectPath, { replace: true });
      })
      .catch((error) => {
        logger.error(error, {
          scope: "kakao-login-callback",
          ...toErrorLogPayload(error),
          codePreview: code.slice(0, 8),
          redirectPath,
        });
        navigate("/login", { replace: true });
      });
  }, [navigate, searchParams, setAccessToken]);

  return <div>카카오 로그인 처리 중</div>;
}
