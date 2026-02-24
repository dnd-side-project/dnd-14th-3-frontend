import type {
  CreatedReservationListDto,
  ReservationCardViewModel,
  ReservationStatus,
} from "@/types/companion-reservation";

import { formatDateTimeLabel } from "@/lib/shared/format";

import { RESERVATION_CARD_STATUS_CONFIG, SHOOTING_DURATION_LABELS } from "@/constants/companion-reservation";

// ─── 내가 올린 예약 카드 ──────────────────────────────────────────
export function createPostedCardViewModel(
  reservation: CreatedReservationListDto,
  status: ReservationStatus,
  labelText: string,
): ReservationCardViewModel {
  const { dateLabel, timeLabel } = formatDateTimeLabel(reservation.scheduledAt);
  const config = RESERVATION_CARD_STATUS_CONFIG[status];

  const applicantMessage =
    status === "recruiting" && reservation.applicantCount > 0
      ? {
          prefix: "현재 ",
          highlight: `${reservation.applicantCount}명`,
          suffix: "이 지원했어요",
          highlightColorClass: "text-mint-500",
        }
      : undefined;

  return {
    status,
    labelText,
    title: reservation.title,
    dateLabel,
    timeLabel,
    locationLabel: reservation.specificPlace,
    tags: [SHOOTING_DURATION_LABELS[reservation.shootingDuration]].filter(Boolean),
    applicantMessage,
    ctaLabel: config.ctaLabel,
    ctaDisabled: config.ctaDisabled,
    ctaVariant: config.ctaVariant,
    className: "shadow-[0_4px_12px_0_rgba(0,0,0,0.06)]",
  };
}
