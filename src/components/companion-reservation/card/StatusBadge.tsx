import type { ReservationStatus } from "@/types/companion-reservation";

import { RESERVATION_STATUS_STYLES } from "@/constants/companion-reservation/status";

export interface StatusBadgeProps {
  status: ReservationStatus;
  labelText: string;
}

export default function StatusBadge({ status, labelText }: StatusBadgeProps) {
  const { labelClass } = RESERVATION_STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center rounded-lg w-fit px-2.5 py-1 text-[12px] font-bold leading-[1.35] ${labelClass}`}
    >
      {labelText}
    </span>
  );
}
