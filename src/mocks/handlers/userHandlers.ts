import { http, HttpResponse, type RequestHandler } from "msw";

export const userHandlers: RequestHandler[] = [
  http.get("/api/v1/users/profiles", async () => {

    return HttpResponse.json({
      success: true,
      message: "SUCCESS",
      code: "",
      data: {
        nickname: "홍길동",
        profileImageUrl: "https://example.com/updated_profile.jpg",
        email: "hong@mail.com",
        phoneNumber: "010-1234-5678",
      },
    });
  }),

  http.patch("/api/v1/users/profiles", async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const body = (await request.json()) as {
      newUsername?: string;
      gender?: string;
      preferredStyles?: string[];
      introduction?: string;
      photos?: string[];
    };
    if (!body.newUsername || !body.gender || !body.preferredStyles?.length) {
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

    return HttpResponse.json(
      {
        success: true,
        message: "SUCCESS",
        code: "",
        data: {
          nickname: "홍길동",
          gender: body.gender,
          preferredStyles: body.preferredStyles,
          introduction: body.introduction,
          photos: body.photos,
        },
      },
      { status: 200 }
    );
  }),

  http.get("/api/v1/consents", async () => {
    return HttpResponse.json({
      success: true,
      message: "SUCCESS",
      code: "",
      data: {
        notificationAllowed: true,
        locationAllowed: true,
        updatedAt: "2025-01-01 12:00:00",
      },
    });
  }),

  http.patch("/api/v1/consents", async ({ request }) => {
    const body = (await request.json()) as {
      notificationAllowed?: boolean;
      locationAllowed?: boolean;
    };

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

    return HttpResponse.json({
      success: true,
      message: "SUCCESS",
      code: "",
      data: {
        notificationAllowed: body.notificationAllowed,
        locationAllowed: body.locationAllowed,
      },
    });
  }),
];
