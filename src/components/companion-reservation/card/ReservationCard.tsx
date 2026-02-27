import { Calendar, Clock, MapPin } from "lucide-react";
import type { ReactNode } from "react";

import type { ReservationStatus } from "@/types/companion-reservation";

import MetaItem from "./MetaItem";
import ReservationCardFooterCTA, {
  type ReservationCardCTAProps,
} from "./ReservationCardFooterCTA";
import ReservationCardFooterPersonnelMessage, {
  type ReservationCardPersonnelMessageProps,
} from "./ReservationCardFooterPersonnelMessage";
import ReservationCardFooterRequesterInfo, {
  type ReservationCardRequesterInfoProps,
} from "./ReservationCardFooterRequesterInfo";
import StatusBadge from "./StatusBadge";
import TagChip from "./TagChip";

interface ReservationCardProps {
  status: ReservationStatus;
  labelText: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  tags?: string[];
  applicantMessage?: {
    prefix: string;
    highlight?: string;
    suffix?: string;
    highlightColorClass?: string;
  };
  footer?: ReactNode;
  onClick?: () => void;
  className?: string;
}

function ReservationCardComponent({
  status,
  labelText,
  title,
  dateLabel,
  timeLabel,
  locationLabel,
  tags = [],
  applicantMessage,
  footer,
  onClick,
  className = "",
}: ReservationCardProps) {
  const hasFooterContent = Boolean(applicantMessage || footer);

  return (
    <section
      className={`flex flex-col gap-4 rounded-2xl w-full bg-white px-4 pb-3 pt-4 shadow-[0_2px_8px_0_rgba(0,0,0,0.06)] ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="flex flex-col gap-3">
        <StatusBadge status={status} labelText={labelText} />

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <h3 className="text-[18px] font-bold leading-[1.45] text-gray-900">{title}</h3>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <MetaItem icon={<Calendar className="size-4" />} text={dateLabel} />
                <MetaItem icon={<Clock className="size-4" />} text={timeLabel} />
              </div>
              <MetaItem icon={<MapPin className="size-4" />} text={locationLabel} />
            </div>
          </div>

          {tags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <TagChip key={tag} label={tag} />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {hasFooterContent ? <div className="border-t border-gray-50" /> : null}

      {applicantMessage ? (
        <ReservationCardFooterPersonnelMessage
          prefix={applicantMessage.prefix}
          highlight={applicantMessage.highlight}
          suffix={applicantMessage.suffix}
          highlightColorClass={applicantMessage.highlightColorClass}
        />
      ) : null}

      {footer ? <div className="pt-1">{footer}</div> : null}
    </section>
  );
}

const ReservationCard = Object.assign(ReservationCardComponent, {
  Footer: {
    CTA: ReservationCardFooterCTA,
    PersonnelMessage: ReservationCardFooterPersonnelMessage,
    RequesterInfo: ReservationCardFooterRequesterInfo,
    },
    TagChip,
    MetaItem,
    StatusBadge
  }
);
export const ReservationCardFooter = {
  CTA: ReservationCardFooterCTA,
  PersonnelMessage: ReservationCardFooterPersonnelMessage,
  RequesterInfo: ReservationCardFooterRequesterInfo,
} as const;

export type {
  ReservationCardCTAProps,
  ReservationCardPersonnelMessageProps,
  ReservationCardProps,
  ReservationCardRequesterInfoProps,
};

export default ReservationCard;