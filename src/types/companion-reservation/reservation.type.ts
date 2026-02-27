import { z } from "zod";

import { REGION_1DEPTH } from "@/constants/companion-reservation/region-1depth";

import { Gender } from "../profile";

export type ShootingDuration =
  | "TEN_MINUTES"
  | "TWENTY_MINUTES"
  | "THIRTY_PLUS_MINUTES"
  | "ONE_HOUR";

// ─── 공통 ────────────────────────────────────────────────────────

export const geoPointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export type GeoPoint = z.infer<typeof geoPointSchema>;

const shootingDurationSchema = z.enum([
  "TEN_MINUTES",
  "TWENTY_MINUTES",
  "THIRTY_PLUS_MINUTES",
  "ONE_HOUR",
]);

const _region1DepthSchema = z.enum(Object.values(REGION_1DEPTH) as [string, ...string[]]);
export type Region1Depth = z.infer<typeof _region1DepthSchema>;

// ─── 피드 (GET /api/v1/reservations) ────────────────────────────

export const reservationSummaryDtoSchema = z.object({
  reservationId: z.number(),
  title: z.string(),
  scheduledAt: z.string(),
  region1Depth: z.string(),
  specificPlace: z.string(),
  shootingDuration: shootingDurationSchema,
  status: z.string(),
  isImminent: z.boolean(),
  ownerId: z.number(),
  ownerNickname: z.string(),
  ownerGender: z.enum(["MALE", "FEMALE"]).optional(),
  ownerProfileImageUrl: z.string().optional(),
});

export const pageResponseReservationSummaryDtoSchema = z.object({
  content: z.array(reservationSummaryDtoSchema),
  nextCursor: z.number().nullable().optional(),
  size: z.number(),
  hasNext: z.boolean(),
  totalElements: z.number().optional(),
});

export type ReservationSummaryDto = z.infer<typeof reservationSummaryDtoSchema>;
export type PageResponseReservationSummaryDto = z.infer<
  typeof pageResponseReservationSummaryDtoSchema
>;

// ─── 상세 (GET /api/v1/reservations/{id}) ───────────────────────

export const reservationDetailDtoSchema = z.object({
  reservationId: z.number(),
  viewCount: z.number(),
  applicantCount: z.number(),
  commentCount: z.number(),
  ownerId: z.number(),
  ownerNickname: z.string(),
  ownerProfileImageUrl: z.string().optional(),
  ownerGender: z.enum(["MALE", "FEMALE"]).optional(),
  title: z.string(),
  scheduledAt: z.string(),
  region1Depth: z.string(),
  specificPlace: z.string(),
  photoStyleSnapshot: z.array(z.string()).optional(),
  shootingDuration: shootingDurationSchema,
  requestMessage: z.string().optional(),
  status: z.string(),
});

export type ReservationDetailDto = z.infer<typeof reservationDetailDtoSchema>;

// ─── 내가 올린 예약 (GET /api/v1/reservations/created) ───────────

export const createdReservationStatusSchema = z.enum([
  "RECRUITING",
  "CONFIRMED",
  "RECRUITMENT_CLOSED",
  "COMPLETED",
  "CANCELED",
]);

export const createdReservationListDtoSchema = z.object({
  reservationId: z.number(),
  status: createdReservationStatusSchema,
  title: z.string(),
  scheduledAt: z.string(),
  region1Depth: z.string(),
  specificPlace: z.string(),
  shootingDuration: shootingDurationSchema,
  applicantCount: z.number(),
});

export const pageResponseCreatedReservationListDtoSchema = z.object({
  content: z.array(createdReservationListDtoSchema),
  nextCursor: z.number().nullable().optional(),
  size: z.number(),
  hasNext: z.boolean(),
  totalElements: z.number().optional(),
});

export type CreatedReservationStatus = z.infer<typeof createdReservationStatusSchema>;
export type CreatedReservationListDto = z.infer<typeof createdReservationListDtoSchema>;
export type PageResponseCreatedReservationListDto = z.infer<
  typeof pageResponseCreatedReservationListDtoSchema
>;

// ─── 내가 지원한 동행 (GET /api/v1/reservations/applied) ─────────

export const appliedReservationStatusSchema = z.enum([
  "WAITING",
  "MATCHED",
  "COMPLETED",
  "REJECTED",
  "CANCELED",
]);

export const appliedReservationListDtoSchema = z.object({
  reservationId: z.number(),
  status: appliedReservationStatusSchema,
  title: z.string(),
  scheduledAt: z.string(),
  region1Depth: z.string(),
  specificPlace: z.string(),
  shootingDuration: shootingDurationSchema,
  applicantCount: z.number(),
});

export const pageResponseAppliedReservationListDtoSchema = z.object({
  content: z.array(appliedReservationListDtoSchema),
  nextCursor: z.number().nullable().optional(),
  size: z.number(),
  hasNext: z.boolean(),
  totalElements: z.number().optional(),
});

export type AppliedReservationStatus = z.infer<typeof appliedReservationStatusSchema>;
export type AppliedReservationListDto = z.infer<typeof appliedReservationListDtoSchema>;
export type PageResponseAppliedReservationListDto = z.infer<
  typeof pageResponseAppliedReservationListDtoSchema
>;

// ─── 지원자 (GET /api/v1/reservations/{id}/applicants) ──────────

export const applicantDtoSchema = z.object({
  applicantId: z.number(),
  userId: z.number(),
  nickname: z.string(),
  profileImageUrl: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"]),
  appliedAt: z.string(),
});

export const applicantListResponseDtoSchema = z.object({
  totalCount: z.number(),
  applicants: z.array(applicantDtoSchema),
});

export type ApplicantDto = z.infer<typeof applicantDtoSchema>;
export type ApplicantListResponseDto = z.infer<typeof applicantListResponseDtoSchema>;

// ─── 댓글 (GET /api/v1/reservations/{id}/comments) ──────────────

export const reservationCommentDtoSchema = z.object({
  commentId: z.number(),
  reservationId: z.number(),
  authorId: z.number(),
  authorNickname: z.string(),
  authorProfileImageUrl: z.string().optional(),
  content: z.string(),
  isDeleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const pageResponseReservationCommentDtoSchema = z.object({
  content: z.array(reservationCommentDtoSchema),
  nextCursor: z.number().nullable().optional(),
  size: z.number(),
  hasNext: z.boolean(),
  totalElements: z.number().optional(),
});

export type ReservationCommentDto = z.infer<typeof reservationCommentDtoSchema>;
export type PageResponseReservationCommentDto = z.infer<
  typeof pageResponseReservationCommentDtoSchema
>;

// ─── 예약 생성/수정 요청 ─────────────────────────────────────────

// ─── 탐색 필터 조건 (GET /api/v1/reservations) ──────────────────

export interface ReservationSearchCondition {
  region1Depth?: Region1Depth | null;
  date?: string | null; // ISO date (YYYY-MM-DD)
  gender?: Gender | null;
  keyword?: string | null;
}

export interface ReservationCreateRequest {
  title: string;
  region1Depth: string;
  specificPlace: string;
  location: GeoPoint;
  scheduledAt: string;
  shootingDuration: ShootingDuration;
  requestMessage?: string;
}

export interface ReservationUpdateRequest {
  title?: string;
  region1Depth?: string;
  specificPlace?: string;
  latitude?: number;
  longitude?: number;
  scheduledAt?: string;
  shootingDuration?: ShootingDuration;
  requestMessage?: string;
}
export type PageResponseAppliedReservationDto = z.infer<
  typeof pageResponseAppliedReservationListDtoSchema
>;
