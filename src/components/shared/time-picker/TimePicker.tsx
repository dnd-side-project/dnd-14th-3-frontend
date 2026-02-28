import { ChevronDown, ChevronUp } from "lucide-react";

/* =====================
 * Types
 * ===================== */
export type TimePeriod = "AM" | "PM";

export interface TimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
  className?: string;
}

/* =====================
 * Helpers
 * ===================== */
function to12Hour(date: Date): { hour: number; minute: number; period: TimePeriod } {
  const hour24 = date.getHours();
  const minute = date.getMinutes();

  if (hour24 === 0) return { hour: 12, minute, period: "AM" };
  if (hour24 < 12) return { hour: hour24, minute, period: "AM" };
  if (hour24 === 12) return { hour: 12, minute, period: "PM" };
  return { hour: hour24 - 12, minute, period: "PM" };
}

function to24Hour(hour12: number, minute: number, period: TimePeriod): number {
  if (period === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

/* =====================
 * Sub-components
 * ===================== */
function SpinnerButton({
  onClick,
  disabled,
  "aria-label": ariaLabel,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  "aria-label": string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex items-center justify-center p-1 text-gray-400 transition-colors hover:text-gray-600 disabled:pointer-events-none disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/* =====================
 * TimePicker Component
 * ===================== */
export default function TimePicker({
  value,
  onChange,
  disabled = false,
  className = "",
}: TimePickerProps) {
  const baseDate = value ?? new Date();
  const { hour, minute, period } = to12Hour(baseDate);

  const updateTime = (newHour: number, newMinute: number, newPeriod: TimePeriod) => {
    const d = value ? new Date(value) : new Date();
    d.setHours(to24Hour(newHour, newMinute, newPeriod));
    d.setMinutes(newMinute);
    d.setSeconds(0, 0);
    onChange(d);
  };

  const incHour = () => {
    const next = hour === 12 ? 1 : hour + 1;
    updateTime(next, minute, period);
  };

  const decHour = () => {
    const next = hour === 1 ? 12 : hour - 1;
    updateTime(next, minute, period);
  };

  const incMinute = () => {
    const next = minute === 59 ? 0 : minute + 1;
    updateTime(hour, next, period);
  };

  const decMinute = () => {
    const next = minute === 0 ? 59 : minute - 1;
    updateTime(hour, next, period);
  };

  const togglePeriod = () => {
    updateTime(hour, minute, period === "AM" ? "PM" : "AM");
  };

  return (
    <div
      className={`flex items-center justify-center gap-1 rounded-xl bg-gray-50 px-4 py-3 ${disabled ? "opacity-60" : ""} ${className}`}
      role="group"
      aria-label="시간 선택"
    >
      {/* Hour */}
      <div className="flex flex-col items-center">
        <SpinnerButton onClick={incHour} disabled={disabled} aria-label="시간 증가">
          <ChevronUp size={20} />
        </SpinnerButton>
        <span className="min-w-[2ch] text-center text-body-1 font-medium text-gray-500">
          {String(hour).padStart(2, "0")}
        </span>
        <SpinnerButton onClick={decHour} disabled={disabled} aria-label="시간 감소">
          <ChevronDown size={20} />
        </SpinnerButton>
      </div>

      {/* Colon */}
      <span className="px-1 text-body-1 font-medium text-gray-400">:</span>

      {/* Minute */}
      <div className="flex flex-col items-center">
        <SpinnerButton onClick={incMinute} disabled={disabled} aria-label="분 증가">
          <ChevronUp size={20} />
        </SpinnerButton>
        <span className="min-w-[2ch] text-center text-body-1 font-medium text-gray-500">
          {String(minute).padStart(2, "0")}
        </span>
        <SpinnerButton onClick={decMinute} disabled={disabled} aria-label="분 감소">
          <ChevronDown size={20} />
        </SpinnerButton>
      </div>

      {/* AM/PM */}
      <button
        type="button"
        onClick={togglePeriod}
        disabled={disabled}
        aria-label={`${period === "AM" ? "오전" : "오후"} 전환`}
        className="ml-2 px-2 py-1 text-body-1 font-medium text-gray-500 transition-colors hover:text-gray-700 disabled:pointer-events-none disabled:opacity-50"
      >
        {period}
      </button>
    </div>
  );
}
