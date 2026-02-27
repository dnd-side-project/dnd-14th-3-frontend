import type {
  AppliedReservationListDto,
  AppliedReservationStatus,
  CreatedReservationListDto,
  CreatedReservationStatus,
  ReservationCardProps,
  ReservationSummaryDto,
} from "@/types/companion-reservation";

import { formatDateTimeLabel } from "@/lib/shared/format";

import {
  RESERVATION_CARD_STATUS_CONFIG,
  SHOOTING_DURATION_LABELS,
} from "@/constants/companion-reservation";

import { getAppliedCardConfig, getCreatedCardConfig } from "./reservationCardConfig.service";

const GENDER_LABELS: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
};

// ─── 공통 베이스 ────────────────────────────────────────────────
function createBaseProps(
  reservation: ReservationSummaryDto | CreatedReservationListDto | AppliedReservationListDto,
): Pick<ReservationCardProps, "title" | "dateLabel" | "timeLabel" | "locationLabel" | "tags" | "className"> {
  const { dateLabel, timeLabel } = formatDateTimeLabel(reservation.scheduledAt);
  
  return {
    title: reservation.title,
    dateLabel,
    timeLabel,
    locationLabel: reservation.specificPlace,
    tags: [SHOOTING_DURATION_LABELS[reservation.shootingDuration]].filter(Boolean),
    className: "shadow-[0_4px_12px_0_rgba(0,0,0,0.06)]",
  };
}

// ─── 둘러보기 카드 ────────────────────────────────────────────
export function toBrowseCardProps(
  reservation: ReservationSummaryDto,
): ReservationCardProps {
  const base = createBaseProps(reservation);
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
    ...base,
    status: "recruiting",
    labelText: config.labelText,
    requesterInfo,
  };
}

// ─── 내가 올린 예약 카드 ──────────────────────────────────────
export function toPostedCardProps(
  reservation: CreatedReservationListDto,
  apiStatus: CreatedReservationStatus,
): ReservationCardProps {
  const base = createBaseProps(reservation);
  const { status, labelText, ctaLabel, ctaVariant } = getCreatedCardConfig(apiStatus);

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
    ...base,
    status,
    labelText,
    applicantMessage,
    ctaLabel,
    ctaVariant,
  };
}

// ─── 내가 지원한 동행 카드 ────────────────────────────────────
export function toAppliedCardProps(
  reservation: AppliedReservationListDto,
  apiStatus: AppliedReservationStatus,
): ReservationCardProps {
  const base = createBaseProps(reservation);
  const { status, labelText, ctaLabel, ctaVariant } = getAppliedCardConfig(apiStatus);

  return {
    ...base,
    status,
    labelText,
    ctaLabel,
    ctaVariant,
  };
}

