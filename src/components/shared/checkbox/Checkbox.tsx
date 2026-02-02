import type { InputHTMLAttributes } from "react";
import { useState } from "react";

/* =====================
 * Types
 * ===================== */
type CheckboxVariant = "primary" | "round";
type CheckboxSize = "normal" | "small";
type CheckboxState = "unchecked" | "checked" | "partial";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "checked" | "defaultChecked"
> {
  size?: CheckboxSize;
  state?: CheckboxState;
  disabled?: boolean;
  className?: string;
}

/* =====================
 * Styles
 * ===================== */
const boxBase = "flex items-center justify-center border";

const variantStyles: Record<CheckboxVariant, string> = {
  primary: "rounded-[3px]",
  round: "rounded-full",
};

const sizeStyles: Record<CheckboxSize, string> = {
  normal: "w-[18px] h-[18px]",
  small: "w-[14px] h-[14px]",
};

const stateStyles: Record<CheckboxState, string> = {
  unchecked: "bg-white border-gray-200",
  checked: "bg-mint-500 border-mint-500",
  partial: "bg-mint-500 border-mint-500",
};

const disabledStyles: Record<CheckboxVariant, Record<CheckboxState, string>> = {
  primary: {
    unchecked: "bg-white border-gray-100",
    checked: "bg-mint-100 border-mint-100",
    partial: "bg-mint-100 border-mint-100",
  },
  round: {
    unchecked: "bg-white border-gray-100",
    checked: "bg-mint-100 border-mint-100",
    partial: "bg-mint-100 border-mint-100",
  },
};

/* =====================
 * Icons
 * ===================== */
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white">
    <path
      d="M5 13l4 4L19 7"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PartialIcon = () => <div className="w-2 h-[1.3px] bg-white rounded-sm" />;

/* =====================
 * Base Checkbox
 * ===================== */
interface BaseCheckboxProps extends CheckboxProps {
  variant: CheckboxVariant;
}

function BaseCheckbox({
  variant,
  size = "normal",
  state = "unchecked",
  disabled = false,
  className = "",
  ...props
}: BaseCheckboxProps) {
  const isChecked = state === "checked";

  const toggle = () => {
    if (disabled) return;

    props.onChange?.({
      target: { checked: !isChecked },
    } as any);
  };

  return (
    <div className={className}>
      <input
        type="checkbox"
        checked={isChecked}
        disabled={disabled}
        className="hidden"
        {...props}
      />

      <div
        onClick={toggle}
        className={[
          boxBase,
          sizeStyles[size],
          variantStyles[variant],
          disabled ? disabledStyles[variant][state] : stateStyles[state],
        ].join(" ")}
      >
        {state === "checked" && <CheckIcon />}
        {state === "partial" && <PartialIcon />}
      </div>
    </div>
  );
}

/* =====================
 * Compound Checkbox
 * ===================== */
type CompoundCheckbox = {
  (props: Omit<BaseCheckboxProps, "variant"> & { variant?: CheckboxVariant }): JSX.Element;
  Primary: (props: CheckboxProps) => JSX.Element;
  Round: (props: CheckboxProps) => JSX.Element;
};

const Checkbox = ((props: any) => (
  <BaseCheckbox variant={props.variant ?? "primary"} {...props} />
)) as CompoundCheckbox;

Checkbox.Primary = (props) => <BaseCheckbox {...props} variant="primary" />;
Checkbox.Round = (props) => <BaseCheckbox {...props} variant="round" />;

export default Checkbox;
