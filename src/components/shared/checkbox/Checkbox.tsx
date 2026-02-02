import type { InputHTMLAttributes } from "react";
import { useState } from "react";

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
  "size" | "checked" | "defaultChecked"
> & {
  size?: CheckboxSize;
  disabled?: boolean;
  className?: string;
};

/* ---------- variant별 props ---------- */
type NormalCheckboxProps = BaseProps & {
  variant?: "primary" | "round";
  state?: NormalState;
};

type CheckCheckboxProps = BaseProps & {
  variant: "check";
  state?: CheckState;
};

type CheckboxProps = NormalCheckboxProps | CheckCheckboxProps;

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
  checked:
    "bg-mint-500 border-mint-500 hover:bg-mint-600 hover:border-mint-600 active:bg-mint-700 active:border-mint-700",
  partial:
    "bg-mint-500 border-mint-500 hover:bg-mint-600 hover:border-mint-600 active:bg-mint-700 active:border-mint-700",
};

const checkStateStyles: Record<CheckState, string> = {
  unchecked: "text-gray-200 hover:text-gray-300 active:text-gray-400",
  checked: "text-mint-500 hover:text-mint-600 active:text-mint-700",
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
const CheckIcon = () => (
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

const PartialIcon = () => <div className="w-3 h-[1.8px] bg-white rounded-sm" />;

/* =====================
 * Base Checkbox
 * ===================== */
function BaseCheckbox(props: CheckboxProps) {
  const {
    variant = "primary",
    size = "normal",
    state = "unchecked",
    disabled = false,
    className = "",
    ...rest
  } = props;

  const isCheck = variant === "check";

  const [internalState, setInternalState] = useState<NormalState | CheckState>(state);

  const isChecked = internalState === "checked";

  const toggle = () => {
    if (disabled) return;

    const nextState = internalState === "checked" ? "unchecked" : "checked";

    setInternalState(nextState);

    rest.onChange?.({
      target: { checked: nextState === "checked" },
    } as any);
  };

  const stateClass = disabled
    ? isCheck
      ? disabledStyles.check[internalState as CheckState]
      : disabledStyles[variant][internalState as NormalState]
    : isCheck
      ? checkStateStyles[internalState as CheckState]
      : stateStyles[internalState as NormalState];

  return (
    <div className={className}>
      <input
        type="checkbox"
        checked={isChecked}
        disabled={disabled}
        readOnly
        className="hidden"
        {...rest}
      />

      <div
        onClick={toggle}
        className={[boxBase, sizeStyles[size], variantStyles[variant], stateClass].join(" ")}
      >
        {internalState !== "partial" && <CheckIcon />}
        {!isCheck && internalState === "partial" && <PartialIcon />}
      </div>
    </div>
  );
}

/* =====================
 * Compound Checkbox
 * ===================== */
type CompoundCheckbox = {
  (props: CheckboxProps): JSX.Element;
  Primary: (props: Omit<NormalCheckboxProps, "variant">) => JSX.Element;
  Round: (props: Omit<NormalCheckboxProps, "variant">) => JSX.Element;
  Check: (props: Omit<CheckCheckboxProps, "variant">) => JSX.Element;
};

const Checkbox = ((props: CheckboxProps) => <BaseCheckbox {...props} />) as CompoundCheckbox;

Checkbox.Primary = (props) => <BaseCheckbox {...props} variant="primary" />;

Checkbox.Round = (props) => <BaseCheckbox {...props} variant="round" />;

Checkbox.Check = (props) => <BaseCheckbox {...props} variant="check" />;

export default Checkbox;
