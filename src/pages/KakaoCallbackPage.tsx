import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { type AxiosError } from "axios";

import { logger } from "@/lib/shared/logger";

import { loginWithKakaoCodeApi } from "@/api/auth.api";

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

function getStringFromCandidate(candidate: unknown): string | null {
  return typeof candidate === "string" && candidate.length > 0 ? candidate : null;
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
        const payload = data as Record<string, unknown>;

        if (data.isNewUser) {
          const registerToken =
            getStringFromCandidate(payload.registerToken) ??
            getStringFromCandidate(payload.register_token) ??
            getStringFromCandidate((payload.token as Record<string, unknown> | undefined)?.registerToken) ??
            getStringFromCandidate((payload.token as Record<string, unknown> | undefined)?.register_token);

          if (!registerToken) {
            logger.error(new Error("Missing register token for new user."), {
              scope: "kakao-login-callback",
              redirectPath,
              payload: data,
            });
            navigate("/login", { replace: true });
            return;
          }

          logger.info("[Auth] New user detected. Redirecting to onboarding.");
          setRegisterToken(registerToken);
          navigate("/onboarding", { replace: true });
          return;
        }

        const tokenObject = (payload.token as Record<string, unknown> | undefined) ?? null;
        const tokensObject = (payload.tokens as Record<string, unknown> | undefined) ?? null;

        const accessToken =
          getStringFromCandidate(payload.accessToken) ??
          getStringFromCandidate(payload.access_token) ??
          getStringFromCandidate(tokenObject?.accessToken) ??
          getStringFromCandidate(tokenObject?.access_token) ??
          getStringFromCandidate(tokensObject?.accessToken) ??
          getStringFromCandidate(tokensObject?.access_token);
        const refreshToken =
          getStringFromCandidate(payload.refreshToken) ??
          getStringFromCandidate(payload.refresh_token) ??
          getStringFromCandidate(tokenObject?.refreshToken) ??
          getStringFromCandidate(tokenObject?.refresh_token) ??
          getStringFromCandidate(tokensObject?.refreshToken) ??
          getStringFromCandidate(tokensObject?.refresh_token);

        if (!accessToken || !refreshToken) {
          logger.error(new Error("Missing auth token(s) from kakao callback response."), {
            scope: "kakao-login-callback",
            redirectPath,
            payload: data,
          });
          navigate("/login", { replace: true });
          return;
        }

        logger.info("[Auth] Token exchange succeeded.", {
          tokenLength: accessToken.length,
          redirectPath,
        });
        setAuthTokens({
          accessToken,
          refreshToken,
        });
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
