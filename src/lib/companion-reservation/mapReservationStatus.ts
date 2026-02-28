import type {
  AppliedReservationStatus,
  CreatedReservationStatus,
  ReservationStatus,
} from "@/types/companion-reservation";

// ─── 내가 올린 예약 상태 매핑 ──────────────────────────────────────
export const CREATED_RESERVATION_STATUS_MAP: Record<CreatedReservationStatus, ReservationStatus> = {
  RECRUITING: "recruiting",
  CONFIRMED: "confirmed",
  RECRUITMENT_CLOSED: "closed",
  COMPLETED: "closed",
  CANCELED: "closed",
};

export const CREATED_RESERVATION_LABEL_MAP: Record<CreatedReservationStatus, string> = {
  RECRUITING: "지원자 모집중",
  CONFIRMED: "확정됨",
  RECRUITMENT_CLOSED: "모집 마감",
  COMPLETED: "일정 완료",
  CANCELED: "취소됨",
};

// ─── 내가 지원한 동행 상태 매핑 ──────────────────────────────────
export const APPLIED_RESERVATION_STATUS_MAP: Record<AppliedReservationStatus, ReservationStatus> = {
  WAITING: "pending",
  MATCHED: "confirmed",
  COMPLETED: "confirmed",
  REJECTED: "closed",
  CANCELED: "closed",
};

export const APPLIED_RESERVATION_LABEL_MAP: Record<AppliedReservationStatus, string> = {
  WAITING: "대기중",
  MATCHED: "매칭 확정",
  COMPLETED: "일정 완료",
  REJECTED: "거절됨",
  CANCELED: "취소됨",
};

export function mapCreatedReservationStatus(status: CreatedReservationStatus): ReservationStatus {
  return CREATED_RESERVATION_STATUS_MAP[status];
}

export function mapCreatedReservationLabel(status: CreatedReservationStatus): string {
  return CREATED_RESERVATION_LABEL_MAP[status];
}

export function mapAppliedReservationStatus(status: AppliedReservationStatus): ReservationStatus {
  return APPLIED_RESERVATION_STATUS_MAP[status];
}

export function mapAppliedReservationLabel(status: AppliedReservationStatus): string {
  return APPLIED_RESERVATION_LABEL_MAP[status];
}

// ─── 하위 호환 (기존 코드에서 사용 중인 함수) ─────────────────────
/** @deprecated mapCreatedReservationStatus 사용 */
export { mapCreatedReservationStatus as mapServerReservationStatus };
/** @deprecated mapAppliedReservationStatus 사용 */
export { mapAppliedReservationStatus as mapApplicationStatus };
