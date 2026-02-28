import type { ReservationStatus } from "@/types/companion-reservation";

import { RESERVATION_STATUS_STYLES } from "@/constants/companion-reservation/status";

import { Button, ButtonProps } from "@/components/shared/button";

export interface ReservationCardCTAProps extends Omit<ButtonProps, "children"> {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  status?: ReservationStatus;
  accentColor?: string;
  variant?: "primary" | "secondary";
  className?: string;
}

export default function ReservationCardFooterCTA({
  label,
  onClick,
  disabled = false,
  status,
  accentColor,
  variant = "primary",
  className = "",
}: ReservationCardCTAProps) {
  const derivedAccent =
    accentColor ?? (status ? RESERVATION_STATUS_STYLES[status].accentColor : undefined);

  const ButtonComponent = variant === "secondary" ? Button.Secondary : Button.Primary;

  return (
    <div className={`relative w-full ${className}`}>
      {derivedAccent ? <div className="absolute inset-x-0 top-0 h-0.5" /> : null}
      <ButtonComponent
        fullWidth
        disabled={disabled}
        onClick={onClick}
        size="large"
        className="text-body-1 font-bold"
      >
        {label}
      </ButtonComponent>
    </div>
  );
}
