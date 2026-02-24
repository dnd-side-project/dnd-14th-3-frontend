/**
 * @deprecated 각 전용 서비스 파일을 사용하세요:
 * - 탐색 카드: browseCardViewModel.service.ts
 * - 내가 올린 예약: postedCardViewModel.service.ts
 * - 내가 지원한 동행: appliedCardViewModel.service.ts
 * - 카드 config 매퍼: reservationCardConfig.service.ts
 */
import type {
  AppliedReservationListDto,
  CreatedReservationListDto,
  ReservationCardViewModel,
  ReservationStatus,
  ReservationSummaryDto,
} from "@/types/companion-reservation";

import { formatDateTimeLabel } from "@/lib/shared/format";

import {
  RESERVATION_CARD_STATUS_CONFIG,
  SHOOTING_DURATION_LABELS,
} from "@/constants/companion-reservation";

export type ReservationCardViewMode = "search" | "me";

interface CreateReservationCardOptions {
  status?: ReservationStatus;
  labelText?: string;
  viewMode?: ReservationCardViewMode;
  ctaLabel?: string;
  ctaDisabled?: boolean;
}

/** @deprecated createBrowseCardViewModel / createPostedCardViewModel 등 사용 */
export function createReservationCardViewModel(
  reservation: ReservationSummaryDto | CreatedReservationListDto | AppliedReservationListDto,
  options: CreateReservationCardOptions = {},
): ReservationCardViewModel {
  const status = options.status ?? "recruiting";
  const config = RESERVATION_CARD_STATUS_CONFIG[status];
  const { dateLabel, timeLabel } = formatDateTimeLabel(reservation.scheduledAt);

  return {
    status,
    labelText: options.labelText ?? config.labelText,
    title: reservation.title,
    dateLabel,
    timeLabel,
    locationLabel: reservation.specificPlace,
    tags: [SHOOTING_DURATION_LABELS[reservation.shootingDuration]].filter(Boolean),
    ctaLabel: options.viewMode === "me" ? (options.ctaLabel ?? config.ctaLabel) : undefined,
    ctaDisabled:
      options.viewMode === "me" ? (options.ctaDisabled ?? config.ctaDisabled) : undefined,
    ctaVariant: options.viewMode === "me" ? config.ctaVariant : undefined,
    className: "shadow-[0_4px_12px_0_rgba(0,0,0,0.06)]",
  };
}

