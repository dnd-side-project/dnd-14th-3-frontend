import { useLocation, useNavigate } from "react-router-dom";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleKakaoLogin = () => {
    const state = location.state as LocationState | undefined;
    const nextPath = state?.from?.pathname ?? "/";
    navigate(`/auth/kakao/callback?code=mock-kakao-code&state=${encodeURIComponent(nextPath)}`, {
      replace: true,
    });
  };

  return (
    <main className="min-h-dvh p-6">
      <div>로그인페이지</div>
      <button
        className="mt-6 rounded-md bg-mint-600 px-4 py-3 text-white"
        onClick={handleKakaoLogin}
        type="button"
      >
        카카오 로그인(Mock)
      </button>
    </main>
  );
}
