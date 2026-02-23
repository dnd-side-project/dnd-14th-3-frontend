import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";

/* =====================
 * Types
 * ===================== */
type CheckboxVariant = "primary" | "round" | "check";
type CheckboxSize = "normal" | "small";

type NormalState = "unchecked" | "checked" | "partial";
type CheckState = "unchecked" | "checked";

/* ---------- 공통 props ---------- */
type BaseProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "checked" | "defaultChecked" | "onChange"
> & {
  size?: CheckboxSize;
  disabled?: boolean;
  className?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

/* ---------- variant별 props ---------- */
type NormalCheckboxProps = BaseProps & {
  variant?: "primary" | "round";
  state: NormalState;
};

type CheckCheckboxProps = BaseProps & {
  variant: "check";
  state: CheckState;
};

export type CheckboxProps = NormalCheckboxProps | CheckCheckboxProps;

/* =====================
 * Styles
 * ===================== */
const boxBase = "flex items-center justify-center";

const variantStyles: Record<CheckboxVariant, string> = {
  primary: "border rounded-[3px] text-white",
  round: "border rounded-full text-white",
  check: "bg-white",
};

const sizeStyles: Record<CheckboxSize, string> = {
  normal: "w-[18px] h-[18px]",
  small: "w-[14px] h-[14px]",
};

const stateStyles: Record<NormalState, string> = {
  unchecked: "bg-white border-gray-200",
  checked: "bg-mint-500 border-mint-500 active:bg-mint-600 active:border-mint-700",
  partial: "bg-mint-500 border-mint-500 active:bg-mint-600 active:border-mint-700",
};

const checkStateStyles: Record<CheckState, string> = {
  unchecked: "text-gray-200 active:text-gray-300",
  checked: "text-mint-500 active:text-mint-600",
};

const disabledStyles = {
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
  check: {
    unchecked: "text-gray-100",
    checked: "text-mint-100",
  },
} satisfies {
  primary: Record<NormalState, string>;
  round: Record<NormalState, string>;
  check: Record<CheckState, string>;
};

/* =====================
 * Icons
 * ===================== */
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PartialIcon() {
  return <div className="w-3 h-[1.8px] bg-white rounded-sm" />;
}

/* =====================
 * Base Checkbox (제어)
 * ===================== */
function BaseCheckbox(props: CheckboxProps & { children?: ReactNode }) {
  const {
    variant = "primary",
    size = "normal",
    state,
    disabled = false,
    className = "",
    children,
    onChange,
    ...rest
  } = props;

  const isCheckVariant = variant === "check";
  const isChecked = state === "checked";

  const handleChange = () => {
    if (disabled || !onChange) return;

    const nextChecked = !isChecked;
    const event = {
      target: { checked: nextChecked },
    } as ChangeEvent<HTMLInputElement>;

    onChange(event);
  };

  const stateClass = disabled
    ? isCheckVariant
      ? disabledStyles.check[state as CheckState]
      : disabledStyles[variant][state as NormalState]
    : isCheckVariant
      ? checkStateStyles[state as CheckState]
      : stateStyles[state as NormalState];

  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        className="hidden"
        {...rest}
      />
      <div className={[boxBase, sizeStyles[size], variantStyles[variant], stateClass].join(" ")}>
        {state !== "partial" && <CheckIcon />}
        {!isCheckVariant && state === "partial" && <PartialIcon />}
      </div>
      {children && (
        <span className={`select-none ${disabled ? "text-gray-300" : ""}`}>{children}</span>
      )}
    </label>
  );
}

/* =====================
 * Checkbox (default export, 함수 선언식)
 * ===================== */
function Checkbox(props: CheckboxProps) {
  return <BaseCheckbox {...props} />;
}

/* =====================
 * Compound Type
 * ===================== */
type CompoundCheckbox = {
  (props: CheckboxProps): JSX.Element;
  Primary: (props: Omit<NormalCheckboxProps, "variant">) => JSX.Element;
  Round: (props: Omit<NormalCheckboxProps, "variant">) => JSX.Element;
  Check: (props: Omit<CheckCheckboxProps, "variant">) => JSX.Element;
};

/* =====================
 * Static Properties (type casting)
 * ===================== */
const TypedCheckbox = Checkbox as unknown as CompoundCheckbox;

TypedCheckbox.Primary = function PrimaryCheckbox(props) {
  return <BaseCheckbox {...props} variant="primary" />;
};

TypedCheckbox.Round = function RoundCheckbox(props) {
  return <BaseCheckbox {...props} variant="round" />;
};

TypedCheckbox.Check = function CheckCheckbox(props) {
  return <BaseCheckbox {...props} variant="check" />;
};

export default TypedCheckbox;
