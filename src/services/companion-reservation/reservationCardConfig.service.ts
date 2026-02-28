import type {
  AppliedReservationStatus,
  CreatedReservationStatus,
  ReservationCardConfig,
} from "@/types/companion-reservation";

/**
 * 내가 올린 예약: API status → 카드 렌더링 config 반환
 */
export function getCreatedCardConfig(status: CreatedReservationStatus): ReservationCardConfig {
  const map: Record<CreatedReservationStatus, ReservationCardConfig> = {
    RECRUITING: {
      status: "recruiting",
      labelText: "모집 중",
      ctaLabel: "지원자 보기",
      ctaVariant: "primary",
    },
    CONFIRMED: {
      status: "confirmed",
      labelText: "매칭 확정",
      ctaLabel: "상세 보기",
      ctaVariant: "secondary",
    },
    RECRUITMENT_CLOSED: {
      status: "closed",
      labelText: "기간 만료",
      ctaLabel: "상세 보기",
      ctaVariant: "secondary",
    },
    COMPLETED: {
      status: "closed",
      labelText: "일정 완료",
      ctaLabel: "상세 보기",
      ctaVariant: "secondary",
    },
    CANCELED: {
      status: "closed",
      labelText: "모집 취소",
      ctaLabel: "상세 보기",
      ctaVariant: "secondary",
    },
  };
  return map[status];
}

/**
 * 내가 지원한 동행: API status → 카드 렌더링 config 반환
 */
export function getAppliedCardConfig(status: AppliedReservationStatus): ReservationCardConfig {
  const map: Record<AppliedReservationStatus, ReservationCardConfig> = {
    WAITING: {
      status: "pending",
      labelText: "대기 중",
      ctaLabel: "상세 보기",
      ctaVariant: "secondary",
    },
    MATCHED: {
      status: "confirmed",
      labelText: "매칭 확정",
      ctaLabel: "상세 보기",
      ctaVariant: "secondary",
    },
    COMPLETED: {
      status: "closed",
      labelText: "일정 완료",
      ctaLabel: "상세 보기",
      ctaVariant: "secondary",
    },
    REJECTED: {
      status: "closed",
      labelText: "거절됨",
      ctaLabel: "상세 보기",
      ctaVariant: "secondary",
    },
    CANCELED: {
      status: "closed",
      labelText: "취소됨",
      ctaLabel: "상세 보기",
      ctaVariant: "secondary",
    },
  };
  return map[status];
}
