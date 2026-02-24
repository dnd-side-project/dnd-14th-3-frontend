import type {
  AppliedReservationListDto,
  ReservationCardViewModel,
  ReservationStatus,
} from "@/types/companion-reservation";

import { formatDateTimeLabel } from "@/lib/shared/format";

import { RESERVATION_CARD_STATUS_CONFIG, SHOOTING_DURATION_LABELS } from "@/constants/companion-reservation";

// ─── 내가 지원한 동행 카드 ────────────────────────────────────────
export function createAppliedCardViewModel(
  reservation: AppliedReservationListDto,
  status: ReservationStatus,
  labelText: string,
): ReservationCardViewModel {
  const { dateLabel, timeLabel } = formatDateTimeLabel(reservation.scheduledAt);
  const config = RESERVATION_CARD_STATUS_CONFIG[status];

  return {
    status,
    labelText,
    title: reservation.title,
    dateLabel,
    timeLabel,
    locationLabel: reservation.specificPlace,
    tags: [SHOOTING_DURATION_LABELS[reservation.shootingDuration]].filter(Boolean),
    ctaLabel: config.ctaLabel,
    ctaDisabled: config.ctaDisabled,
    ctaVariant: config.ctaVariant,
    className: "shadow-[0_4px_12px_0_rgba(0,0,0,0.06)]",
  };
}
