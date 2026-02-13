import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { loginWithKakaoCodeApi } from "@/api/auth.api";

import { useAuthStore } from "@/store/auth/auth.store";

export default function KakaoCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    const code = searchParams.get("code");
    const redirectPath = searchParams.get("state") ?? "/";

    if (!code) {
      navigate("/login", { replace: true });
      return;
    }

    loginWithKakaoCodeApi(code)
      .then(({ accessToken }) => {
        setAccessToken(accessToken);
        navigate(redirectPath, { replace: true });
      })
      .catch(() => {
        navigate("/login", { replace: true });
      });
  }, [navigate, searchParams, setAccessToken]);

  return <div>카카오 로그인 처리 중</div>;
}
