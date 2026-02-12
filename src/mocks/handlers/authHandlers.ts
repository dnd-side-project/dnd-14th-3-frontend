import { http, HttpResponse, type RequestHandler } from "msw";

const MOCK_KAKAO_CODE = "mock-kakao-code";
const MOCK_ACCESS_TOKEN = "mock-kakao-access-token";

function isAuthorized(request: Request) {
  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${MOCK_ACCESS_TOKEN}`;
}

export const authHandlers: RequestHandler[] = [
  http.post("/auth/kakao/login", async ({ request }) => {
    const body = (await request.json()) as { code?: string };

    if (body.code !== MOCK_KAKAO_CODE) {
      return HttpResponse.json({ message: "Invalid kakao code" }, { status: 400 });
    }

    return HttpResponse.json({ accessToken: MOCK_ACCESS_TOKEN }, { status: 200 });
  }),
  http.get("/users/me", ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({ id: 1 }, { status: 200 });
  }),
];
