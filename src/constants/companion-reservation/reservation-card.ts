import type { ReservationStatus } from "@/types/companion-reservation";

export const RESERVATION_CARD_STATUS_CONFIG: Record<
  ReservationStatus,
  { labelText: string; ctaLabel: string; ctaDisabled: boolean; ctaVariant: "primary" | "secondary" }
> = {
  recruiting: {
    labelText: "지원자 모집중",
    ctaLabel: "지원자 보기",
    ctaDisabled: false,
    ctaVariant: "primary",
  },
  confirmed: {
    labelText: "확정됨",
    ctaLabel: "상세 보기",
    ctaDisabled: false,
    ctaVariant: "secondary",
  },
  pending: {
    labelText: "대기중",
    ctaLabel: "상세 보기",
    ctaDisabled: true,
    ctaVariant: "secondary",
  },
  closed: {
    labelText: "종료된 일정",
    ctaLabel: "상세 보기",
    ctaDisabled: false,
    ctaVariant: "secondary",
  },
};
