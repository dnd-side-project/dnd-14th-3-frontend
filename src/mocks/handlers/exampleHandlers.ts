import { http, HttpResponse ,RequestHandler} from "msw";

/**
 * 예시 handler. 실제 API 연동 시 도메인별 handler로 교체하세요.
 */
export const exampleHandlers: RequestHandler[] = [
  http.get("/api/example", () => {
    return HttpResponse.json({ message: "ok" });
  }),
];
