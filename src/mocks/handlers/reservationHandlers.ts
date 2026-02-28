import { http, HttpResponse, type RequestHandler } from "msw";

import type {
  ApplicantListResponseDto,
  CreatedReservationListDto,
  PageResponseAppliedReservationListDto,
  PageResponseCreatedReservationListDto,
  PageResponseReservationCommentDto,
  PageResponseReservationSummaryDto,
  ReservationCommentDto,
  ReservationDetailDto,
  ReservationSummaryDto,
} from "@/types/companion-reservation";

// ─── 목 데이터 ─────────────────────────────────────────────────────

const mockFeed: ReservationSummaryDto[] = [
  {
    reservationId: 101,
    title: "홍대에서 사진 동행 구해요",
    scheduledAt: "2026-02-20T14:30:00",
    region1Depth: "서울특별시",
    specificPlace: "홍대입구역 9번 출구",
    shootingDuration: "TWENTY_MINUTES",
    status: "RECRUITING",
    ownerId: 1,
    ownerNickname: "개발자",
    ownerGender: "MALE",
    ownerProfileImageUrl: "http://localhost:3845/assets/b8463b7c90c4ed29f5e3bcc370b07c76119ee2a3.png",
    isImminent: false
  },
  {
    reservationId: 102,
    title: "강남역 느좋 카페 촬영",
    scheduledAt: "2026-02-21T16:00:00",
    region1Depth: "서울특별시",
    specificPlace: "강남역 10번 출구 앞",
    shootingDuration: "THIRTY_PLUS_MINUTES",
    status: "RECRUITING",
    ownerId: 2,
    ownerNickname: "포토러버",
    ownerGender: "FEMALE",
    ownerProfileImageUrl: "http://localhost:3845/assets/b8463b7c90c4ed29f5e3bcc370b07c76119ee2a3.png",
    isImminent: false
  },
];

const mockDetail: ReservationDetailDto = {
  reservationId: 101,
  viewCount: 7,
  applicantCount: 3,
  commentCount: 2,
  ownerId: 2,
  ownerNickname: "개발자",
  ownerProfileImageUrl:
    "http://localhost:3845/assets/b8463b7c90c4ed29f5e3bcc370b07c76119ee2a3.png",
  ownerGender: "MALE",
  ownerAgeGroup: "TWENTIES",
  ownerIntroduction: "인물사진 위주로 찍는 걸 좋아하는 개발자입니다.",
  title: "홍대에서 사진 동행 구해요",
  scheduledAt: "2026-02-20T14:30:00",
  region1Depth: "서울특별시",
  specificPlace: "홍대입구역 9번 출구",
  photoStyleSnapshot: ["FULL_BODY", "OUTDOOR_NATURAL_LIGHT"],
  shootingDuration: "TWENTY_MINUTES",
  requestMessage: "자연스러운 분위기 원해요!",
  status: "RECRUITING",
};

const mockCreated: CreatedReservationListDto[] = [
  {
    reservationId: 201,
    status: "RECRUITING",
    title: "홍대에서 사진 동행 구해요",
    scheduledAt: "2026-02-05T14:00:00",
    region1Depth: "서울특별시",
    specificPlace: "홍대입구역 9번 출구",
    shootingDuration: "TWENTY_MINUTES",
    applicantCount: 3,
  },
  {
    reservationId: 202,
    status: "RECRUITMENT_CLOSED",
    title: "강남역 느좋 카페 촬영",
    scheduledAt: "2026-02-06T16:00:00",
    region1Depth: "서울특별시",
    specificPlace: "강남역 10번 출구",
    shootingDuration: "THIRTY_PLUS_MINUTES",
    applicantCount: 0,
  },
  {
    reservationId: 203,
    status: "RECRUITING",
    title: "연남동 감성 스냅 동행 구해요",
    scheduledAt: "2026-02-10T11:00:00",
    region1Depth: "서울특별시",
    specificPlace: "연남동 경의선숲길",
    shootingDuration: "THIRTY_PLUS_MINUTES",
    applicantCount: 1,
  },
  {
    reservationId: 204,
    status: "COMPLETED",
    title: "이태원 루프탑 야경 사진 동행",
    scheduledAt: "2026-02-14T18:30:00",
    region1Depth: "서울특별시",
    specificPlace: "이태원역 3번 출구",
    shootingDuration: "TWENTY_MINUTES",
    applicantCount: 2,
  },
  {
    reservationId: 205,
    status: "RECRUITING",
    title: "서울숲 벚꽃 시즌 동행 모집",
    scheduledAt: "2026-03-28T10:00:00",
    region1Depth: "서울특별시",
    specificPlace: "서울숲역 3번 출구",
    shootingDuration: "THIRTY_PLUS_MINUTES",
    applicantCount: 5,
  },
];

const mockApplied: PageResponseAppliedReservationListDto["content"] = [
  {
    reservationId: 301,
    status: "WAITING",
    title: "성수동 카페 투어 동행 구해요",
    scheduledAt: "2026-02-10T13:00:00",
    region1Depth: "서울특별시",
    specificPlace: "성수역 2번 출구",
    shootingDuration: "THIRTY_PLUS_MINUTES",
    applicantCount: 2,
  },
  {
    reservationId: 302,
    status: "MATCHED",
    title: "북촌 한옥마을 인물사진 동행",
    scheduledAt: "2026-02-12T11:00:00",
    region1Depth: "서울특별시",
    specificPlace: "안국역 1번 출구",
    shootingDuration: "TWENTY_MINUTES",
    applicantCount: 4,
  },
  {
    reservationId: 303,
    status: "REJECTED",
    title: "경복궁 근처 봄 사진 동행",
    scheduledAt: "2026-02-15T10:00:00",
    region1Depth: "서울특별시",
    specificPlace: "경복궁역 5번 출구",
    shootingDuration: "TEN_MINUTES",
    applicantCount: 1,
  },
  {
    reservationId: 304,
    status: "WAITING",
    title: "을지로 힙한 카페 스냅 동행",
    scheduledAt: "2026-02-18T15:00:00",
    region1Depth: "서울특별시",
    specificPlace: "을지로3가역 6번 출구",
    shootingDuration: "TWENTY_MINUTES",
    applicantCount: 3,
  },
  {
    reservationId: 305,
    status: "MATCHED",
    title: "망원한강공원 일몰 사진 동행",
    scheduledAt: "2026-02-20T17:00:00",
    region1Depth: "서울특별시",
    specificPlace: "망원역 1번 출구",
    shootingDuration: "THIRTY_PLUS_MINUTES",
    applicantCount: 2,
  },
  {
    reservationId: 306,
    status: "WAITING",
    title: "익선동 한복 스냅 동행 구해요",
    scheduledAt: "2026-02-22T13:00:00",
    region1Depth: "서울특별시",
    specificPlace: "종로3가역 4번 출구",
    shootingDuration: "THIRTY_PLUS_MINUTES",
    applicantCount: 6,
  },
  {
    reservationId: 307,
    status: "REJECTED",
    title: "잠실 롯데타워 야경 동행",
    scheduledAt: "2026-02-24T19:00:00",
    region1Depth: "서울특별시",
    specificPlace: "잠실역 1번 출구",
    shootingDuration: "TWENTY_MINUTES",
    applicantCount: 5,
  },
  {
    reservationId: 308,
    status: "WAITING",
    title: "마포 카페거리 프로필 사진 동행",
    scheduledAt: "2026-03-01T12:00:00",
    region1Depth: "서울특별시",
    specificPlace: "마포역 2번 출구",
    shootingDuration: "TEN_MINUTES",
    applicantCount: 1,
  },
];

const mockApplicants: ApplicantListResponseDto = {
  totalCount: 2,
  applicants: [
    {
      applicantId: 1001,
      userId: 10,
      nickname: "사진좋아",
      profileImageUrl:
        "http://localhost:3845/assets/b8463b7c90c4ed29f5e3bcc370b07c76119ee2a3.png",
      gender: "FEMALE",
      appliedAt: "2026-02-18T10:00:00",
    },
    {
      applicantId: 1002,
      userId: 11,
      nickname: "스냅마니아",
      gender: "MALE",
      appliedAt: "2026-02-18T11:00:00",
    },
  ],
};

const initialComments: ReservationCommentDto[] = [
  {
    commentId: 1,
    reservationId: 101,
    authorId: 2,
    authorNickname: "라이언",
    authorProfileImageUrl:
      "http://localhost:3845/assets/b8463b7c90c4ed29f5e3bcc370b07c76119ee2a3.png",
    content: "저 지원했는데 확인 부탁드려요!",
    isDeleted: false,
    createdAt: "2026-02-18T10:00:00",
    updatedAt: "2026-02-18T10:00:00",
  },
];

const reservationDetailDb = new Map<number, ReservationDetailDto>([[
  mockDetail.reservationId,
  {
    ...mockDetail,
    commentCount: initialComments.length,
    photoStyleSnapshot: mockDetail.photoStyleSnapshot
      ? [...mockDetail.photoStyleSnapshot]
      : undefined,
  },
]]);

const commentsDb = new Map<number, ReservationCommentDto[]>([[
  mockDetail.reservationId,
  [...initialComments],
]]);

const appliedReservationDb = new Set<number>();

let nextCommentId =
  initialComments.length > 0
    ? Math.max(...initialComments.map((comment) => comment.commentId)) + 1
    : 1;

// ─── 핸들러 ────────────────────────────────────────────────────────

export const reservationHandlers: RequestHandler[] = [
  // 피드(동행 탐색)
  http.get("/api/v1/reservations", ({ request }) => {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");
    const pageSize = limit ? Number(limit) : 10;
    const sliced = mockFeed.slice(0, pageSize);

    const response: PageResponseReservationSummaryDto = {
      content: sliced,
      nextCursor: null,
      size: pageSize,
      hasNext: false,
      totalElements: sliced.length,
    };

    return HttpResponse.json({data:response});
  }),

  // 내가 올린 예약
  http.get("/api/v1/reservations/created", ({ request }) => {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");
    const pageSize = limit ? Number(limit) : 10;

    const response: PageResponseCreatedReservationListDto = {
      content: mockCreated.slice(0, pageSize),
      nextCursor: null,
      size: pageSize,
      hasNext: false,
      totalElements: mockCreated.length,
    };

    return HttpResponse.json({data:response});
  }),

  // 내가 지원한 동행
  http.get("/api/v1/reservations/applied", ({ request }) => {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");
    const pageSize = limit ? Number(limit) : 10;

    const response: PageResponseAppliedReservationListDto = {
      content: mockApplied.slice(0, pageSize),
      nextCursor: null,
      size: pageSize,
      hasNext: false,
      totalElements: mockApplied.length,
    };

    return HttpResponse.json({data:response});
  }),

  // 예약 상세
  http.get("/api/v1/reservations/:reservationId", ({ params }) => {
    const reservationId = Number(params.reservationId);
    const detail = reservationDetailDb.get(reservationId);

    if (!detail) {
      return HttpResponse.json(
        { success: false, message: "예약 글을 찾을 수 없습니다.", code: "RESERVATION_NOT_FOUND" },
        { status: 404 },
      );
    }

    return HttpResponse.json({ data: detail });
  }),

  // 예약 생성
  http.post("/api/v1/reservations", async () => {
    return HttpResponse.json({ success: true, data: 999 }, { status: 201 });
  }),

  // 예약 취소(삭제)
  http.delete("/api/v1/reservations/:reservationId", ({ params }) => {
    const reservationId = Number(params.reservationId);
    const detail = reservationDetailDb.get(reservationId);

    if (!detail) {
      return HttpResponse.json(
        { success: false, message: "예약 글을 찾을 수 없습니다.", code: "RESERVATION_NOT_FOUND" },
        { status: 404 },
      );
    }

    detail.status = "CANCELED";

    const feedItem = mockFeed.find((reservation) => reservation.reservationId === reservationId);
    if (feedItem) {
      feedItem.status = "CANCELED";
    }

    const createdItem = mockCreated.find(
      (reservation) => reservation.reservationId === reservationId,
    );
    if (createdItem) {
      createdItem.status = "CANCELED";
    }

    return HttpResponse.json({ success: true });
  }),

  // 예약 수정
  http.patch("/api/v1/reservations/:reservationId", () => {
    return HttpResponse.json({ success: true });
  }),

  // 동행 지원
  http.post("/api/v1/reservations/:reservationId/apply", ({ params }) => {
    const reservationId = Number(params.reservationId);
    const detail = reservationDetailDb.get(reservationId);

    if (!detail) {
      return HttpResponse.json(
        { success: false, message: "예약 글을 찾을 수 없습니다.", code: "RESERVATION_NOT_FOUND" },
        { status: 404 },
      );
    }

    if (!appliedReservationDb.has(reservationId)) {
      appliedReservationDb.add(reservationId);
      detail.applicantCount += 1;
    }

    return HttpResponse.json({ success: true });
  }),

  // 동행 지원 취소
  http.delete("/api/v1/reservations/:reservationId/apply", ({ params }) => {
    const reservationId = Number(params.reservationId);
    const detail = reservationDetailDb.get(reservationId);

    if (!detail) {
      return HttpResponse.json(
        { success: false, message: "예약 글을 찾을 수 없습니다.", code: "RESERVATION_NOT_FOUND" },
        { status: 404 },
      );
    }

    if (appliedReservationDb.has(reservationId)) {
      appliedReservationDb.delete(reservationId);
      detail.applicantCount = Math.max(0, detail.applicantCount - 1);
    }

    return HttpResponse.json({ success: true });
  }),

  // 지원자 목록
  http.get("/api/v1/reservations/:reservationId/applicants", () => {
    return HttpResponse.json({data: mockApplicants});
  }),

  // 지원자 수락
  http.post("/api/v1/reservations/:reservationId/applicants/:applicantId/accept", () => {
    return HttpResponse.json({ success: true });
  }),

  // 지원자 거절
  http.post("/api/v1/reservations/:reservationId/applicants/:applicantId/reject", () => {
    return HttpResponse.json({ success: true });
  }),

  // 댓글 목록
  http.get("/api/v1/reservations/:reservationId/comments", ({ params, request }) => {
    const reservationId = Number(params.reservationId);
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");
    const pageSize = limit ? Number(limit) : 10;
    const reservationComments = commentsDb.get(reservationId) ?? [];

    const response: PageResponseReservationCommentDto = {
      content: reservationComments.slice(0, pageSize),
      nextCursor: null,
      size: pageSize,
      hasNext: false,
      totalElements: reservationComments.length,
    };

    return HttpResponse.json({data: response});
  }),

  // 댓글 작성
  http.post("/api/v1/reservations/:reservationId/comments", async ({ params, request }) => {
    const reservationId = Number(params.reservationId);
    const detail = reservationDetailDb.get(reservationId);

    if (!detail) {
      return HttpResponse.json(
        { success: false, message: "예약 글을 찾을 수 없습니다.", code: "RESERVATION_NOT_FOUND" },
        { status: 404 },
      );
    }

    const body = (await request.json()) as { content?: string };
    const content = body.content?.trim();

    if (!content) {
      return HttpResponse.json(
        { success: false, message: "댓글 내용을 입력해주세요." },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const reservationComments = commentsDb.get(reservationId) ?? [];

    const newComment: ReservationCommentDto = {
      commentId: nextCommentId,
      reservationId,
      authorId: 1,
      authorNickname: "개발자",
      authorProfileImageUrl: mockDetail.ownerProfileImageUrl,
      content,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };

    nextCommentId += 1;

    commentsDb.set(reservationId, [newComment, ...reservationComments]);
    detail.commentCount = (commentsDb.get(reservationId) ?? []).length;

    return HttpResponse.json({ success: true });
  }),
];
