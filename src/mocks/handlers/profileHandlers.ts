import { http, HttpResponse, type RequestHandler } from "msw";

import { FALLBACK_SHOOTING_STYLES } from "@/constants/on-board";

/** 모킹: 이미 사용 중인 닉네임 (중복 검사 실패용) */
const MOCK_DUPLICATE_NICKNAME = "중복닉네임";
/** 모킹: 금지어 포함 (금지어 검사 실패용) */
const MOCK_FORBIDDEN_NICKNAME = "운영자";

export const profileHandlers: RequestHandler[] = [
  http.get("/api/v1/profile/shooting-styles", () => {
    console.log("[MSW] GET /api/shooting-styles");
    return HttpResponse.json({
      styles: FALLBACK_SHOOTING_STYLES,
    });
  }),

  http.post("/api/v1/profile/validate-nickname", async ({ request }) => {
    console.log("[MSW] POST /api/v1/profile/validate-nickname");
    const body = (await request.json()) as { nickname?: string };
    const nickname = body.nickname ?? "";

    if (nickname === MOCK_DUPLICATE_NICKNAME) {
      return HttpResponse.json({
        success: true,
        message: "이미 사용 중인 닉네임입니다",
        code: "DUPLICATE_NICKNAME",
        data: false,
      });
    }
    if (nickname === MOCK_FORBIDDEN_NICKNAME || nickname.includes("관리자")) {
      return HttpResponse.json({
        success: true,
        message: "사용할 수 없는 닉네임입니다",
        code: "FORBIDDEN_NICKNAME",
        data: false,
      });
    }

    return HttpResponse.json({
      success: true,
      message: "사용 가능한 닉네임입니다",
      code: "OK",
      data: true,
    });
  }),
];
