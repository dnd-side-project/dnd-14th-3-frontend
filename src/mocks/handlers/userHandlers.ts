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

    return HttpResponse.json({
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
    }, { status: 203 });
  }),
];
