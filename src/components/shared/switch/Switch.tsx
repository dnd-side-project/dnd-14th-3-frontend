import type { InputHTMLAttributes, ReactNode } from "react";

/* =====================
 * Types
 * ===================== */
type SwitchSize = "normal" | "small";

export interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "checked" | "defaultChecked"
> {
  size?: SwitchSize;
  checked: boolean;
  disabled?: boolean;
  label?: ReactNode;
  className?: string;
}

/* =====================
 * Styles
 * ===================== */
const trackBase =
  "relative inline-flex items-center rounded-[100px] transition-colors duration-200";

const sizeStyles: Record<SwitchSize, string> = {
  normal: "w-[52px] h-[32px]",
  small: "w-[39px] h-[24px]",
};

const thumbStyles: Record<SwitchSize, string> = {
  normal: "w-[24px] h-[24px]",
  small: "w-[18px] h-[18px]",
};

const translateStyles: Record<SwitchSize, string> = {
  normal: "translate-x-[20px]",
  small: "translate-x-[15px]",
};

const thumbPositionStyles: Record<SwitchSize, string> = {
  normal: "left-[4px] top-[4px]",
  small: "left-[3px] top-[3px]",
};

const trackStateStyles = {
  on: "bg-mint-500 hover:bg-mint-600 active:bg-mint-700",
  off: "bg-gray-200 hover:bg-gray-300 active:bg-gray-400",
  disabledOn: "bg-mint-100",
  disabledOff: "bg-gray-100",
};

const thumbBase = "absolute rounded-full bg-white transition-transform duration-200";

/* =====================
 * Switch Component
 * ===================== */
export default function Switch({
  size = "normal",
  checked,
  disabled = false,
  label,
  className = "",
  onChange,
  ...rest
}: SwitchProps) {
  const toggle = () => {
    if (disabled) return;

    const event = {
      target: { checked: !checked },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange?.(event);
  };

  const trackClass = disabled
    ? checked
      ? trackStateStyles.disabledOn
      : trackStateStyles.disabledOff
    : checked
      ? trackStateStyles.on
      : trackStateStyles.off;

  return (
    <label
      className={`inline-flex items-center gap-2 cursor-pointer ${
        disabled ? "cursor-not-allowed" : ""
      } ${className}`}
    >
      <input
        type="checkbox"
        className="hidden"
        checked={checked}
        disabled={disabled}
        onChange={toggle}
        {...rest}
      />

      <div className={[trackBase, sizeStyles[size], trackClass].join(" ")}>
        <div
          className={[
            thumbBase,
            thumbPositionStyles[size],
            thumbStyles[size],
            checked ? translateStyles[size] : "translate-x-0",
          ].join(" ")}
        />
      </div>

      {label && <span className={`select-none ${disabled ? "text-gray-300" : ""}`}>{label}</span>}
    </label>
  );
}
