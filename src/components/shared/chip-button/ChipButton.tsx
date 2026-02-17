import type { ButtonHTMLAttributes, ReactNode } from "react";

/* =====================
 * Types
 * ===================== */
type ChipButtonSize = "medium" | "small";

export interface ChipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  selected?: boolean;
  size?: ChipButtonSize;
  disabled?: boolean;
  className?: string;
}

/* =====================
 * Styles
 * ===================== */
const chipStyles = {
  base: "inline-flex items-center justify-center font-bold transition-colors border",
  default:
    "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300 active:bg-gray-300",
  selected:
    "bg-mint-500 border-mint-500 text-black hover:bg-mint-600 hover:border-mint-600 active:bg-mint-700 active:border-mint-700",
  disabled: "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed",
} as const;

const sizeStyles: Record<ChipButtonSize, string> = {
  medium: "h-9 px-4 rounded-md text-label-1",
  small: "h-7 px-3 rounded-sm text-label-2",
};

/* =====================
 * ChipButton
 * ===================== */
function ChipButton({
  children,
  selected = false,
  size = "medium",
  disabled = false,
  className = "",
  ...props
}: ChipButtonProps) {
  const stateStyle = disabled
    ? chipStyles.disabled
    : selected
      ? chipStyles.selected
      : chipStyles.default;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      className={`${chipStyles.base} ${sizeStyles[size]} ${stateStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default ChipButton;
