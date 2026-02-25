import { http, HttpResponse, type RequestHandler } from "msw";

import {
  type CreateMatchRequestData,
  type MatchExpectedDuration,
} from "@/types/main-map/match-request.type";

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
let mockIsWaitingForMatch = false;
let mockCurrentMatchRequest: CreateMatchRequestData | null = null;

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
    mockIsWaitingForMatch = true;
    const nowIso = new Date().toISOString();

    mockCurrentMatchRequest = {
      matchRequestId: mockMatchRequestId,
      status: "WAITING",
      specificPlace: body.specificPlace ?? "",
      location: {
        latitude: body.location!.latitude!,
        longitude: body.location!.longitude!,
      },
      expectedDuration: body.expectedDuration!,
      requestMessage: body.requestMessage ?? "",
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    return HttpResponse.json(
      {
        success: true,
        message: "매칭 대기가 생성되었습니다.",
        code: "MATCH_REQUEST_CREATED",
        data: mockCurrentMatchRequest,
      },
      { status: 201 }
    );
  }),

  http.get("/api/v1/match-requests/:matchRequestId", ({ params }) => {
    const requestId = Number(params.matchRequestId);
    if (!mockCurrentMatchRequest || !Number.isFinite(requestId)) {
      return HttpResponse.json(
        {
          success: false,
          message: "매칭 요청을 찾을 수 없습니다.",
          code: "MATCH_REQUEST_NOT_FOUND",
          data: null,
        },
        { status: 404 }
      );
    }

    if (mockCurrentMatchRequest.matchRequestId !== requestId) {
      return HttpResponse.json(
        {
          success: false,
          message: "매칭 요청을 찾을 수 없습니다.",
          code: "MATCH_REQUEST_NOT_FOUND",
          data: null,
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        message: "매칭 대기 조회 성공",
        code: "MATCH_REQUEST_FOUND",
        data: mockCurrentMatchRequest,
      },
      { status: 200 }
    );
  }),

  http.delete("/api/v1/match-requests/me", () => {
    mockIsWaitingForMatch = false;
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/sse", ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get("scenario");

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const encoder = new TextEncoder();

        const pushEvent = (eventName: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${eventName}\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        controller.enqueue(encoder.encode(": connected\n\n"));

        const eventTimer = globalThis.setTimeout(() => {
          if (!mockIsWaitingForMatch) return;

          if (scenario === "expired") {
            pushEvent("match.request.expired", {
              userId: 1,
              matchRequestId: mockCurrentMatchRequest?.matchRequestId ?? mockMatchRequestId,
              expiresAt: new Date(Date.now() + 60 * 1000).toISOString(),
            });
            mockIsWaitingForMatch = false;
            return;
          }

          if (mockCurrentMatchRequest) {
            mockCurrentMatchRequest = {
              ...mockCurrentMatchRequest,
              status: "MATCHED",
              updatedAt: new Date().toISOString(),
            };
          }

          pushEvent("match.proposal", {
            id: 12,
            userAId: 3,
            userBId: 4,
            status: "ACCEPTED",
            userADecision: "ACCEPTED",
            userBDecision: "ACCEPTED",
          });
          mockIsWaitingForMatch = false;
        }, 20000);

        const keepAliveTimer = globalThis.setInterval(() => {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        }, 15000);

        return () => {
          globalThis.clearTimeout(eventTimer);
          globalThis.clearInterval(keepAliveTimer);
        };
      },
    });

    return new HttpResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }),
];
