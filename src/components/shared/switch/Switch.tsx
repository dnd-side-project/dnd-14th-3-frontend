import { useState } from "react";

import type { InputHTMLAttributes, ReactNode } from "react";

/* =====================
 * Types
 * ===================== */
type SwitchSize = "normal" | "small";

interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "checked" | "defaultChecked"
> {
  size?: SwitchSize;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  label?: ReactNode;
}

/* =====================
 * Styles
 * ===================== */
const trackBase =
  "relative inline-flex items-center rounded-[100px] transition-colors duration-200";

const sizeStyles = {
  normal: "w-[52px] h-[32px]",
  small: "w-[39px] h-[24px]",
} satisfies Record<SwitchSize, string>;

const thumbStyles = {
  normal: "w-[24px] h-[24px]",
  small: "w-[18px] h-[18px]",
} satisfies Record<SwitchSize, string>;

const translateStyles = {
  normal: "translate-x-[20px]",
  small: "translate-x-[15px]",
} satisfies Record<SwitchSize, string>;

const trackStateStyles = {
  on: "bg-mint-500 hover:bg-mint-600 active:bg-mint-700",
  off: "bg-gray-200 hover:bg-gray-300 active:bg-gray-400",
  disabledOn: "bg-mint-100",
  disabledOff: "bg-gray-100",
};

const thumbBase = "absolute rounded-full bg-white transition-transform duration-200";

const thumbPositionStyles = {
  normal: "left-[4px] top-[4px]",
  small: "left-[3px] top-[3px]",
} satisfies Record<SwitchSize, string>;

/* =====================
 * Switch Component
 * ===================== */
function Switch({
  size = "normal",
  checked,
  defaultChecked = false,
  disabled = false,
  label,
  className = "",
  onChange,
  ...rest
}: SwitchProps) {
  const isControlled = checked !== undefined;

  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isOn = isControlled ? checked : internalChecked;

  const toggle = () => {
    if (disabled) return;

    const next = !isOn;
    if (!isControlled) {
      setInternalChecked(next);
    }

    const event = {
      target: { checked: next },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange?.(event);
  };
  const trackClass = disabled
    ? isOn
      ? trackStateStyles.disabledOn
      : trackStateStyles.disabledOff
    : isOn
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
        checked={isOn}
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
            isOn ? translateStyles[size] : "translate-x-0",
          ].join(" ")}
        />
      </div>

      {label && <span className={`select-none ${disabled ? "text-gray-300" : ""}`}>{label}</span>}
    </label>
  );
}

export default Switch;
