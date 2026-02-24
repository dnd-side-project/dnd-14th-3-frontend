import type {
  ReservationCardViewModel,
  ReservationSummaryDto,
} from "@/types/companion-reservation";

import { formatDateTimeLabel } from "@/lib/shared/format";

import { RESERVATION_CARD_STATUS_CONFIG, SHOOTING_DURATION_LABELS } from "@/constants/companion-reservation";

const GENDER_LABELS: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
};

// ─── 피드(탐색) 카드 ────────────────────────────────────────────
export function createBrowseCardViewModel(
  reservation: ReservationSummaryDto,
): ReservationCardViewModel {
  const { dateLabel, timeLabel } = formatDateTimeLabel(reservation.scheduledAt);
  const config = RESERVATION_CARD_STATUS_CONFIG.recruiting;

  const requesterInfo =
    reservation.ownerProfileImageUrl
      ? {
          avatarUrl: reservation.ownerProfileImageUrl,
          description: reservation.ownerGender
            ? `${reservation.ownerNickname} · ${GENDER_LABELS[reservation.ownerGender] ?? ""}`
            : reservation.ownerNickname,
        }
      : undefined;

  return {
    status: "recruiting",
    labelText: config.labelText,
    title: reservation.title,
    dateLabel,
    timeLabel,
    locationLabel: reservation.specificPlace,
    tags: [SHOOTING_DURATION_LABELS[reservation.shootingDuration]].filter(Boolean),
    requesterInfo,
    className: "shadow-[0_4px_12px_0_rgba(0,0,0,0.06)]",
  };
}
