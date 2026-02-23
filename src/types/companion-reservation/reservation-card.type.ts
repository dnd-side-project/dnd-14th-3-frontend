import type { ReservationStatus } from "./index";

export interface ReservationCardConfig {
  status: ReservationStatus;
  labelText: string;
  ctaLabel?: string;
  ctaDisabled: boolean;
  ctaVariant?: "primary" | "secondary";
}

export interface ReservationCardApplicantMessage {
  prefix: string;
  highlight?: string;
  suffix?: string;
  highlightColorClass?: string;
}

export interface ReservationCardRequesterInfo {
  avatarUrl: string;
  description: string;
}

export interface ReservationCardViewModel {
  status: ReservationStatus;
  labelText: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  tags: string[];
  applicantMessage?: ReservationCardApplicantMessage;
  requesterInfo?: ReservationCardRequesterInfo;
  ctaLabel?: string;
  ctaDisabled?: boolean;
  ctaVariant?: "primary" | "secondary";
  className?: string;
}
