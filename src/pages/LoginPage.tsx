import { useLocation, useNavigate } from "react-router-dom";

import { logger } from "@/lib/shared/logger";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

function buildKakaoAuthorizeUrl(redirectPath: string) {
  const clientId = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    state: redirectPath,
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleKakaoLogin = () => {
    const state = location.state as LocationState | undefined;
    const nextPath = state?.from?.pathname ?? "/";
    const authorizeUrl = buildKakaoAuthorizeUrl(nextPath);

    if (!authorizeUrl) {
      logger.warn("[Auth] Kakao authorize URL missing. Check env vars.", {
        hasRestApiKey: Boolean(import.meta.env.VITE_KAKAO_REST_API_KEY),
        redirectUri: import.meta.env.VITE_KAKAO_REDIRECT_URI,
      });

      navigate(`/auth/kakao/callback?code=mock-kakao-code&state=${encodeURIComponent(nextPath)}`, {
        replace: true,
      });
      return;
    }

    logger.info("[Auth] Redirecting to Kakao authorize endpoint.", {
      redirectPath: nextPath,
      redirectUri: import.meta.env.VITE_KAKAO_REDIRECT_URI,
      authorizeUrl,
    });

    window.location.href = authorizeUrl;
  };

  return (
    <main className="min-h-dvh p-6">
      <button
        className="mt-6 rounded-md bg-mint-600 px-4 py-3 text-white"
        onClick={handleKakaoLogin}
        type="button"
      >
        카카오 로그인
      </button>
    </main>
  );
}
