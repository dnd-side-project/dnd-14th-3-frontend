import { http, HttpResponse, type RequestHandler } from "msw";

const MOCK_KAKAO_CODE = "mock-kakao-code";
const MOCK_REGISTER_TOKEN = "mock-register-token";
const MOCK_ACCESS_TOKEN = "mock-kakao-access-token";
const MOCK_REFRESH_TOKEN = "mock-kakao-refresh-token";

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
  http.post("/api/v1/auth/signup", async ({ request }) => {
    const registerToken = request.headers.get("register-token");

    if (registerToken !== MOCK_REGISTER_TOKEN) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      nickname?: string;
      gender?: string;
      profileImageUrl?: string;
      photoStyles?: string[];
    };

    if (!body.nickname || !body.gender || !body.photoStyles?.length) {
      return HttpResponse.json({ message: "Invalid signup payload" }, { status: 400 });
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
  http.get("/users/me", ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({ id: 1 }, { status: 200 });
  }),
];

