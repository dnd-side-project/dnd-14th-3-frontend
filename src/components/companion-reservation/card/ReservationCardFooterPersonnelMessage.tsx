export interface ReservationCardPersonnelMessageProps {
  prefix: string;
  highlight?: string;
  suffix?: string;
  highlightColorClass?: string;
  className?: string;
}

export default function ReservationCardFooterPersonnelMessage({
  prefix,
  highlight,
  suffix,
  highlightColorClass = "text-mint-500",
  className = "",
}: ReservationCardPersonnelMessageProps) {
  return (
    <p className={`text-sm leading-[1.4] text-gray-600 ${className}`}>
      <span>{prefix}</span>
      {highlight ? (
        <span className={`px-0.5 font-bold ${highlightColorClass}`}>{highlight}</span>
      ) : null}
      {suffix ? <span>{suffix}</span> : null}
    </p>
  );
}
