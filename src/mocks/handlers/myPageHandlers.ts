import { http, HttpResponse, type RequestHandler } from "msw";

export const myPageHandlers: RequestHandler[] = [
  http.get("/api/v1/my-page/summary", async () => {
    return HttpResponse.json({
      success: true,
      message: "SUCCESS",
      code: "",
      data: {
        nickname: "사진수집가",
        profileImageUrl: undefined,
        rating: 5,
        companionCount: 12,
        gender: "FEMALE",
        ageRange: "20s",
        introduction: "풍경과 인물 사진을 좋아해요. 함께 좋은 사진 찍어요!",
        shootingStyleLabels: ["감성", "자연광", "필름"],
      },
    });
  }),
];
