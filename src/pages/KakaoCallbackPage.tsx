import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { type AxiosError } from "axios";

import { logger } from "@/lib/shared/logger";

import { loginWithKakaoCodeApi, verifySessionApi } from "@/api/auth.api";

import { useAuthStore } from "@/store/auth/auth.store";

import { LoadingIndicator } from "@/components/shared/loading";

const processingKakaoCodes = new Set<string>();

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
  const setAuthTokens = useAuthStore((state) => state.setAuthTokens);
  const setRegisterToken = useAuthStore((state) => state.setRegisterToken);

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

    if (processingKakaoCodes.has(code)) {
      logger.info("[Auth] Duplicate callback detected. Ignoring duplicated code exchange.", {
        codePreview: code.slice(0, 8),
      });
      return;
    }

    processingKakaoCodes.add(code);

    loginWithKakaoCodeApi(code)
      .then(({ data }) => {
        if (data.isNewUser) {
          logger.info("[Auth] New user detected. Redirecting to onboarding.");
          setRegisterToken(data.registerToken);
          navigate("/onboarding", { replace: true });
          return;
        }

        logger.info("[Auth] Token exchange succeeded.", {
          tokenLength: data.accessToken.length,
          redirectPath,
        });
        setAuthTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        navigate(redirectPath, { replace: true });
      })
      .catch(async (error) => {
        logger.error(error, {
          scope: "kakao-login-callback",
          ...toErrorLogPayload(error),
          codePreview: code.slice(0, 8),
          redirectPath,
        });

        try {
          await verifySessionApi();
          logger.info("[Auth] Session verification succeeded after kakao code exchange failure.", {
            redirectPath,
          });
          navigate(redirectPath, { replace: true });
        } catch (verifyError) {
          logger.warn("[Auth] Session verification failed after kakao code exchange failure.", {
            ...toErrorLogPayload(verifyError),
            redirectPath,
          });
          navigate("/login", { replace: true });
        }
      })
      .finally(() => {
        processingKakaoCodes.delete(code);
      });
  }, [navigate, searchParams, setAuthTokens, setRegisterToken]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <LoadingIndicator />
    </div>
  );
}
