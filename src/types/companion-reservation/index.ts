export type ReservationStatus = "recruiting" | "confirmed" | "pending" | "closed";
export type ViewSegment = "browse" | "mine";
export type MineSubTab = "posted" | "applied";
export type { FilterTab, FilterValues } from "./filter.type";
export type { ShootingDuration } from "./reservation.type";
export type {
  ApplicantDto,
  ApplicantListResponseDto,
  AppliedReservationListDto,
  AppliedReservationStatus,
  CreatedReservationListDto,
  CreatedReservationStatus,
  GeoPoint,
  PageResponseAppliedReservationListDto,
  PageResponseCreatedReservationListDto,
  PageResponseReservationCommentDto,
  PageResponseReservationSummaryDto,
  ReservationCommentDto,
  ReservationCreateRequest,
  ReservationDetailDto,
  ReservationSearchCondition,
  ReservationSummaryDto,
  ReservationUpdateRequest,
} from "./reservation.type";
export {
  applicantDtoSchema,
  applicantListResponseDtoSchema,
  appliedReservationListDtoSchema,
  appliedReservationStatusSchema,
  createdReservationListDtoSchema,
  createdReservationStatusSchema,
  geoPointSchema,
  pageResponseAppliedReservationListDtoSchema,
  pageResponseCreatedReservationListDtoSchema,
  pageResponseReservationCommentDtoSchema,
  pageResponseReservationSummaryDtoSchema,
  reservationCommentDtoSchema,
  reservationDetailDtoSchema,
  reservationSummaryDtoSchema,
} from "./reservation.type";
export type {
  ReservationCardApplicantMessage,
  ReservationCardConfig,
  ReservationCardRequesterInfo,
  ReservationCardViewModel,
} from "./reservation-card.type";
export type { ReservationSearchFilter } from "./reservation-search-filter.type";