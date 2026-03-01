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
let mockPendingMatchSession: { id: number; userAId: number; userBId: number } | null = null;
let mockActiveSseScenario: string | null = null;
const mockArrivedSessionIds = new Set<number>();

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

  http.get("/api/v1/match-sessions/:sessionId", ({ params }) => {
    const sessionId = Number(params.sessionId);
    if (!Number.isFinite(sessionId)) {
      return HttpResponse.json(
        {
          success: false,
          message: "매칭 세션을 찾을 수 없습니다.",
          code: "MATCH_SESSION_NOT_FOUND",
          data: null,
        },
        { status: 404 }
      );
    }

    const fallbackLocation = { latitude: 37.5665, longitude: 126.978 };
    const sourceLocation = mockCurrentMatchRequest?.location ?? fallbackLocation;
    const sourceMatchRequestId = mockCurrentMatchRequest?.matchRequestId ?? 100;
    const sourceMatchStatus = mockCurrentMatchRequest?.status ?? "WAITING";
    const sourceSpecificPlace = mockCurrentMatchRequest?.specificPlace ?? "서울시청 앞";
    const sourceRequestMessage =
      mockCurrentMatchRequest?.requestMessage ?? "전신 사진 구도 맞춰서 찍어주실 분 구해요.";
    const sourceExpectedDuration = mockCurrentMatchRequest?.expectedDuration ?? "TWENTY_MINUTES";

    return HttpResponse.json(
      {
        success: true,
        message: "매칭 세션 조회 성공",
        code: "MATCH_SESSION_FOUND",
        data: {
          id: sessionId,
          status: "ACTIVE",
          destination: {
            latitude: sourceLocation.latitude - 0.0005,
            longitude: sourceLocation.longitude + 0.0005,
          },
          matchedAt: new Date().toISOString(),
          endedAt: null,
          me: {
            userId: 3,
            nickname: "me",
            gender: "MALE",
            arrived: mockArrivedSessionIds.has(sessionId),
            request: {
              matchRequestId: sourceMatchRequestId,
              status: sourceMatchStatus,
              specificPlace: sourceSpecificPlace,
              requestMessage: sourceRequestMessage,
              expectedDuration: sourceExpectedDuration,
            },
          },
          partner: {
            userId: 4,
            nickname: "사진메이트",
            gender: "FEMALE",
            arrived: false,
            request: {
              matchRequestId: sourceMatchRequestId + 1,
              status: "WAITING",
              specificPlace: sourceSpecificPlace,
              requestMessage: "전신 사진 구도 맞춰서 찍어주실 분 구해요.",
              expectedDuration: "TWENTY_MINUTES",
            },
          },
        },
      },
      { status: 200 }
    );
  }),

  http.delete("/api/v1/match-requests/me", () => {
    mockIsWaitingForMatch = false;
    mockPendingMatchSession = null;
    mockArrivedSessionIds.clear();
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch("/api/v1/match-sessions/:sessionId/arrive", ({ params }) => {
    const sessionId = Number(params.sessionId);
    if (!Number.isFinite(sessionId)) {
      return HttpResponse.json(
        {
          success: false,
          message: "매칭 세션을 찾을 수 없습니다.",
          code: "MATCH_SESSION_NOT_FOUND",
          data: null,
        },
        { status: 404 }
      );
    }

    mockArrivedSessionIds.add(sessionId);
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch("/api/v1/match-sessions/:sessionId/start-meeting", ({ params }) => {
    const sessionId = Number(params.sessionId);
    if (!Number.isFinite(sessionId)) {
      return HttpResponse.json(
        {
          success: false,
          message: "매칭 세션을 찾을 수 없습니다.",
          code: "MATCH_SESSION_NOT_FOUND",
          data: null,
        },
        { status: 404 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  http.patch("/api/v1/match-requests/:matchRequestId/retry", ({ params }) => {
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

    if (mockCurrentMatchRequest.status !== "EXPIRED") {
      return HttpResponse.json(
        {
          success: false,
          message: "아직 대기 시간이 남아 있어 재시도할 수 없습니다.",
          code: "MATCH_REQUEST_NOT_EXPIRED",
          data: null,
        },
        { status: 409 }
      );
    }

    mockCurrentMatchRequest = {
      ...mockCurrentMatchRequest,
      status: "WAITING",
      updatedAt: new Date().toISOString(),
    };
    mockIsWaitingForMatch = true;

    return HttpResponse.json(
      {
        success: true,
        message: "재시도에 성공했습니다.",
        code: "MATCH_REQUEST_RETRIED",
        data: {
          ...mockCurrentMatchRequest,
          nearbyWaitingCount: 3,
        },
      },
      { status: 200 }
    );
  }),

  http.post("/api/v1/match-proposals/:proposalId/reject", ({ params }) => {
    console.log("[MSW] POST /api/v1/match-proposals/:proposalId/reject", params);
    const proposalId = Number(params.proposalId);
    if (!Number.isFinite(proposalId) || proposalId <= 0) {
      return HttpResponse.json(
        {
          success: false,
          message: "매칭 제안을 찾을 수 없습니다.",
          code: "MATCH_PROPOSAL_NOT_FOUND",
          data: null,
        },
        { status: 404 }
      );
    }

    mockPendingMatchSession = null;

    return HttpResponse.json(
      {
        success: true,
        message: "매칭 제안을 거절했습니다.",
        code: "MATCH_PROPOSAL_REJECTED",
        data: {
          id: proposalId,
          userAId: 3,
          userBId: 4,
          status: "REJECTED",
          userADecision: "REJECTED",
          userBDecision: "PENDING",
        },
      },
      { status: 200 }
    );
  }),

  http.post("/api/v1/match-proposals/:proposalId/accept", ({ params }) => {
    console.log("[MSW] POST /api/v1/match-proposals/:proposalId/accept", params);
    const proposalId = Number(params.proposalId);
    if (!Number.isFinite(proposalId) || proposalId <= 0) {
      return HttpResponse.json(
        {
          success: false,
          message: "매칭 제안을 찾을 수 없습니다.",
          code: "MATCH_PROPOSAL_NOT_FOUND",
          data: null,
        },
        { status: 404 }
      );
    }

    if (mockActiveSseScenario === "proposal-rejected") {
      mockPendingMatchSession = null;
    } else {
      mockPendingMatchSession = {
        id: 3,
        userAId: 3,
        userBId: 4,
      };
    }

    return HttpResponse.json(
      {
        success: true,
        message: "매칭 제안을 수락했습니다.",
        code: "MATCH_PROPOSAL_ACCEPTED",
        data: {
          id: proposalId,
          userAId: 3,
          userBId: 4,
          status: "PENDING",
          userADecision: "ACCEPTED",
          userBDecision: "PENDING",
        },
      },
      { status: 200 }
    );
  }),

  http.get("/api/sse", ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get("scenario");
    mockActiveSseScenario = scenario;

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const encoder = new TextEncoder();

        const pushEvent = (eventName: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${eventName}\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        controller.enqueue(encoder.encode(": connected\n\n"));
        if (mockIsWaitingForMatch) {
          pushEvent("match.request.waiting-count", { nearbyWaitingCount: 12 });
        }

        const waitingCountTimer = globalThis.setInterval(() => {
          if (!mockIsWaitingForMatch) return;
          const nearbyWaitingCount = Math.max(1, Math.floor(8 + Math.random() * 6));
          pushEvent("match.request.waiting-count", { nearbyWaitingCount });
        }, 4000);
        const disconnectTimer =
          scenario === "disconnect"
            ? globalThis.setTimeout(() => {
                controller.close();
              }, 3000)
            : null;
        let proposalRejectedTimeout: ReturnType<typeof globalThis.setTimeout> | null = null;

        const eventTimer = globalThis.setTimeout(() => {
          if (!mockIsWaitingForMatch) return;

          if (scenario === "expired") {
            if (mockCurrentMatchRequest) {
              mockCurrentMatchRequest = {
                ...mockCurrentMatchRequest,
                status: "EXPIRED",
                updatedAt: new Date().toISOString(),
              };
            }
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
          if (scenario === "proposal-rejected") {
            proposalRejectedTimeout = globalThis.setTimeout(() => {
              pushEvent("match.proposal.rejected", {
                id: 12,
                userAId: 3,
                userBId: 4,
                status: "REJECTED",
                userADecision: "ACCEPTED",
                userBDecision: "REJECTED",
              });
            }, 10000);
          }
          mockIsWaitingForMatch = false;
        }, 20000);

        const matchSessionTimer = globalThis.setInterval(() => {
          if (!mockPendingMatchSession) return;
          pushEvent("match.session", mockPendingMatchSession);
          mockPendingMatchSession = null;
        }, 5000);

        const keepAliveTimer = globalThis.setInterval(() => {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        }, 15000);

        return () => {
          globalThis.clearInterval(waitingCountTimer);
          globalThis.clearTimeout(eventTimer);
          globalThis.clearInterval(matchSessionTimer);
          if (proposalRejectedTimeout !== null) {
            globalThis.clearTimeout(proposalRejectedTimeout);
          }
          if (disconnectTimer !== null) {
            globalThis.clearTimeout(disconnectTimer);
          }
          globalThis.clearInterval(keepAliveTimer);
          mockActiveSseScenario = null;
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
