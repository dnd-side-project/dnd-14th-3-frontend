import { http, HttpResponse, type RequestHandler } from "msw";

import { type MatchExpectedDuration } from "@/types/main-map/match-request.type";

interface MatchRequestBody {
  location?: {
    latitude?: number;
    longitude?: number;
  };
  specificPlace?: string;
  requestMessage?: string;
  expectedDuration?: MatchExpectedDuration;
}

const ALLOWED_DURATIONS: MatchExpectedDuration[] = [
  "TEN_MINUTES",
  "TWENTY_MINUTES",
  "OVER_THIRTY_MINUTES",
];

let mockMatchRequestId = 100;

export const mainMapHandlers: RequestHandler[] = [
  http.post("/api/v1/match-requests", async ({ request }) => {
    const body = (await request.json()) as MatchRequestBody;
    const fieldErrors: Array<{ field: string; message: string; code: string }> = [];

    if (!body.specificPlace?.trim()) {
      fieldErrors.push({
        field: "specificPlace",
        message: "구체적인 장소는 필수입니다.",
        code: "NotBlank",
      });
    }

    if (!body.expectedDuration || !ALLOWED_DURATIONS.includes(body.expectedDuration)) {
      fieldErrors.push({
        field: "expectedDuration",
        message: "예상 촬영 소요 시간은 필수입니다.",
        code: "NotNull",
      });
    }

    if (
      typeof body.location?.latitude !== "number" ||
      typeof body.location?.longitude !== "number"
    ) {
      fieldErrors.push({
        field: "location",
        message: "위치 정보는 필수입니다.",
        code: "NotNull",
      });
    }

    if (fieldErrors.length > 0) {
      return HttpResponse.json(
        {
          success: false,
          message: "요청 값 검증에 실패했습니다.",
          code: "VALIDATION_FAILED",
          data: { fieldErrors },
        },
        { status: 400 }
      );
    }

    mockMatchRequestId += 1;
    const nowIso = new Date().toISOString();

    return HttpResponse.json(
      {
        success: true,
        message: "매칭 대기가 생성되었습니다.",
        code: "MATCH_REQUEST_CREATED",
        data: {
          matchRequestId: mockMatchRequestId,
          status: "WAITING",
          specificPlace: body.specificPlace,
          location: {
            latitude: body.location!.latitude,
            longitude: body.location!.longitude,
          },
          expectedDuration: body.expectedDuration,
          requestMessage: body.requestMessage ?? "",
          createdAt: nowIso,
          updatedAt: nowIso,
        },
      },
      { status: 201 }
    );
  }),
];

