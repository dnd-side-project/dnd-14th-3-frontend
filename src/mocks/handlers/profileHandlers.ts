import { http, HttpResponse, type RequestHandler } from "msw";

import { FALLBACK_SHOOTING_STYLES } from "@/constants/on-board";

const MOCK_DUPLICATE_NICKNAME = "중복닉네임";

export const profileHandlers: RequestHandler[] = [
  http.get("/api/v1/photo-style", () => {
    console.log("[MSW] GET /api/v1/photo-style");
    return HttpResponse.json({
      success: true,
      message: "OK",
      code: "OK",
      data: FALLBACK_SHOOTING_STYLES.map((style, index) => ({
        id: index,
        name: style.id,
      })),
    });
  }),

  http.post("/api/v1/users/check-nickname", async ({ request }) => {
    console.log("[MSW] POST /api/v1/users/check-nickname");
    const body = (await request.json()) as { nickname?: string };
    const nickname = body.nickname ?? "";

    if (!nickname.trim()) {
      return HttpResponse.json(
        {
          success: false,
          message: "요청 값 검증에 실패했습니다.",
          code: "VALIDATION_FAILED",
          data: {
            fieldErrors: [
              {
                field: "nickname",
                message: "공백일 수 없습니다",
                code: "NotBlank",
              },
            ],
          },
        },
        { status: 400 }
      );
    }

    if (nickname === MOCK_DUPLICATE_NICKNAME) {
      return HttpResponse.json({
        success: true,
        message: "이미 사용 중인 닉네임입니다.",
        code: "OK",
        data: false,
      });
    }

    return HttpResponse.json({
      success: true,
      message: "사용 가능한 닉네임입니다.",
      code: "OK",
      data: true,
    });
  }),
];
