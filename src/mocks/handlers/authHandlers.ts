import { http, HttpResponse, type RequestHandler } from "msw";

import { SignupRequest } from "@/api/auth";

const MOCK_KAKAO_CODE = "mock-kakao-code";
const MOCK_ACCESS_TOKEN = "mock-kakao-access-token";
const MOCK_REFRESH_TOKEN = "mock-kakao-refresh-token";

/** 회원가입 성공 시 사용할 Register-Token (localStorage register_token에 저장) */
export const MOCK_REGISTER_TOKEN = "mock-register-token";

/** 토큰 에러 시나리오 테스트용 - 401 TOKEN_EXPIRED 반환 */
export const MOCK_REGISTER_TOKEN_EXPIRED = "mock-register-token-expired";

/** 토큰 에러 시나리오 테스트용 - 401 INVALID_TOKEN 반환 */
export const MOCK_REGISTER_TOKEN_INVALID = "mock-register-token-invalid";

function isAuthorized(request: Request) {
  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${MOCK_ACCESS_TOKEN}`;
}

export const authHandlers: RequestHandler[] = [
  http.get("/api/v1/auth/login/kakao", ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return HttpResponse.json({ message: "Invalid kakao code" }, { status: 400 });
    }

    if (code === "mock-new-user-code") {
      return HttpResponse.json(
        {
          success: true,
          message: "회원가입이 필요합니다.",
          code: "",
          data: {
            isNewUser: true,
            registerToken: MOCK_REGISTER_TOKEN,
          },
        },
        { status: 200 }
      );
    }

    if (code !== MOCK_KAKAO_CODE) {
      return HttpResponse.json({ message: "Invalid kakao code" }, { status: 400 });
    }

    return HttpResponse.json(
      {
        success: true,
        message: "로그인 성공",
        code: "",
        data: {
          isNewUser: false,
          accessToken: MOCK_ACCESS_TOKEN,
          refreshToken: MOCK_REFRESH_TOKEN,
        },
      },
      { status: 200 }
    );
  }),
  http.post("/api/v1/auth/refresh", ({ request }) => {
    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${MOCK_REFRESH_TOKEN}`) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json(
      {
        success: true,
        message: "OK",
        code: "",
        data: {
          accessToken: MOCK_ACCESS_TOKEN,
          refreshToken: MOCK_REFRESH_TOKEN,
        },
      },
      { status: 200 }
    );
  }),
  http.get("/api/v1/auth/verify", ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json(
        {
          success: false,
          message: "인증이 필요합니다.",
          code: "UNAUTHORIZED",
          data: null,
        },
        { status: 401 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        message: "세션이 유효합니다.",
        code: "",
        data: "VALID",
      },
      { status: 200 }
    );
  }),
  http.get("/users/me", ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({ id: 1 }, { status: 200 });
  }),

  http.post("/api/v1/auth/signup", async ({ request }) => {
    const registerToken = request.headers.get("Register-Token") ?? request.headers.get("register-token");
    const body = (await request.json()) as SignupRequest;

    if (!body.gender || !body.nickname || !body.photoStyles?.length) {
      return HttpResponse.json(
        { success: false, message: "잘못된 요청입니다.", code: "INVALID_REQUEST", data: null },
        { status: 400 }
      );
    }

    if (!registerToken) {
      return HttpResponse.json(
        { success: false, message: "토큰이 필요합니다.", code: "INVALID_TOKEN", data: null },
        { status: 401 }
      );
    }

    if (registerToken === MOCK_REGISTER_TOKEN_EXPIRED) {
      return HttpResponse.json(
        { success: false, message: "토큰이 만료되었습니다.", code: "TOKEN_EXPIRED", data: null },
        { status: 401 }
      );
    }

    if (registerToken === MOCK_REGISTER_TOKEN_INVALID) {
      return HttpResponse.json(
        { success: false, message: "유효하지 않은 토큰입니다.", code: "INVALID_TOKEN", data: null },
        { status: 401 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        message: "회원가입 성공",
        code: "",
        data: {
          accessToken: MOCK_ACCESS_TOKEN,
          refreshToken: MOCK_REFRESH_TOKEN,
        },
      },
      { status: 200 }
    );
  }),
];
