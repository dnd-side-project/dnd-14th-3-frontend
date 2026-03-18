import { useLocation, useNavigate } from "react-router-dom";

import { logger } from "@/lib/shared/logger";

import { Toast } from "@/store/shared/toast/toast.store";

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
    const isMockMode = import.meta.env.VITE_MSW_ENABLED === "true";

    if (isMockMode) {
      logger.info("[Auth] Mock mode enabled. Bypassing Kakao authorize and using mock callback.", {
        redirectPath: nextPath,
      });
      navigate(`/auth/kakao/callback?code=mock-kakao-code&state=${encodeURIComponent(nextPath)}`, {
        replace: true,
      });
      return;
    }

    const authorizeUrl = buildKakaoAuthorizeUrl(nextPath);

    if (!authorizeUrl) {
      logger.warn("[Auth] Kakao authorize URL missing. Check env vars.", {
        hasRestApiKey: Boolean(import.meta.env.VITE_KAKAO_REST_API_KEY),
        redirectUri: import.meta.env.VITE_KAKAO_REDIRECT_URI,
      });
      Toast.show({
        type: "error",
        message: "로그인 설정이 올바르지 않습니다.\n잠시 후 다시 시도해주세요.",
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
    <main className="flex min-h-dvh flex-col px-6 pb-8">
      <section className="flex flex-1 flex-col items-center justify-center">
        <img
          src="/login/login_hero_tagline.png"
          alt="혼자여도, 기록은 함께"
          className="mt-20 h-auto w-[11rem]"
        />
        <img
          src="/login/login_hero_logo.png"
          alt="찍어줄게 로고"
          className="mt-6 h-auto w-[11.3rem]"
        />
        <img
          src="/login/login_hero_map.png"
          alt="찍어줄게 소개 지도 이미지"
          className="mt-[10vh] h-auto w-full max-w-[18.5rem]"
        />
      </section>

      <button
        className="mt-auto rounded-lg bg-[#FEE500] h-[54px] flex flex-row justify-center items-center gap-4 cursor-pointer active:bg-[#E5CF00]"
        onClick={handleKakaoLogin}
        type="button"
      >
        <img src="/login/kakao_icon.png" alt="카카오 아이콘" className="inline h-4 w-auto" />
        <span className="font-semibold">카카오로 시작하기</span>
      </button>
    </main>
  );
}
