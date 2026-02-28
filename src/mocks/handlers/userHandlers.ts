import { http, HttpResponse, type RequestHandler } from "msw";

import type { PatchUserConsentsRequest, PatchUserProfileRequest } from "@/api/user";

let consents = {
  notificationAllowed: true,
  locationAllowed: true,
  updatedAt: "2025-01-01T12:00:00.000Z",
};

export const userHandlers: RequestHandler[] = [
  /** 본인 프로필 조회 (userId 경로) */
  http.get("/api/v1/users/:userId/profiles", () => {
    return HttpResponse.json({
      success: true,
      message: "SUCCESS",
      code: "",
      data: {
        userId: 1,
        nickname: "홍길동",
        gender: "MALE",
        ageGroup: "TWENTIES",
        introduction: "사진 찍는 걸 좋아합니다.",
        profileImageUrl: "https://example.com/profile.jpg",
        photoStyles: ["SNS_UPLOAD", "FULL_BODY"],
        consent: { ...consents },
      },
    });
  }),

  /** 본인 프로필 수정 (userId 경로) */
  http.patch("/api/v1/users/:userId/profiles", async ({ request }) => {
    const body = (await request.json()) as PatchUserProfileRequest;

    if (!body.nickname?.trim()) {
      return HttpResponse.json(
        {
          success: false,
          message: "필수 항목이 누락되었습니다",
          code: "INVALID_PROFILE_REQUEST",
          data: null,
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      nickname: body.nickname,
      gender: body.gender,
      ageGroup: body.ageGroup,
      introduction: body.introduction,
      profileImageUrl: body.profileImageUrl ?? "https://example.com/updated_profile.jpg",
      photoStyles: body.photoStyles,
    });
  }),

  /** 본인 동의 설정 조회 */
  http.get("/api/v1/users/:userId/consents", () => {
    return HttpResponse.json({ ...consents });
  }),

  /** 본인 동의 설정 수정 */
  http.patch("/api/v1/users/:userId/consents", async ({ request }) => {
    const body = (await request.json()) as PatchUserConsentsRequest;

    if (
      typeof body.notificationAllowed !== "boolean" ||
      typeof body.locationAllowed !== "boolean"
    ) {
      return HttpResponse.json(
        {
          success: false,
          message: "요청한 권한 동의 설정 정보가 올바르지 않습니다.",
          code: "INVALID_CONSENT_REQUEST",
          data: null,
        },
        { status: 400 }
      );
    }

    consents = {
      notificationAllowed: body.notificationAllowed,
      locationAllowed: body.locationAllowed,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ ...consents });
  }),
];
