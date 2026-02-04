import type { ChangeEvent, InputHTMLAttributes, ReactElement, ReactNode } from "react";

/* =====================
 * Types
 * ===================== */
type RadioSize = "normal" | "small";
type RadioState = "checked" | "unchecked";

export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "checked" | "size" | "onChange"
> {
  value: string;
  size?: RadioSize;
  state?: RadioState;
  disabled?: boolean;
  children?: ReactNode;
  onChange?: (value: string) => void;
}

interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}

/* =====================
 * Base Radio
 * ===================== */
function BaseRadio({
  value,
  name,
  size = "normal",
  state = "unchecked",
  checked = false,
  disabled = false,
  onChange,
  children,
  ...props
}: RadioProps & { checked?: boolean }) {
  const isChecked = checked || state === "checked";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onChange?.(e.target.value);
  };

  const sizeClass =
    size === "small" ? "w-[14px] h-[14px] border-[4.5px]" : "w-[20px] h-[20px] border-6";

  return (
    <label
      className={`inline-flex items-center gap-2 cursor-pointer ${disabled ? "cursor-not-allowed" : ""}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        className="hidden"
        {...props}
      />
      <span
        className={`flex items-center justify-center border rounded-full bg-white
          ${disabled ? (isChecked ? "border-mint-100" : "border-gray-100") : isChecked ? "border-mint-500" : "border-gray-300"}
          ${sizeClass}`}
      ></span>
      {children && <span>{children}</span>}
    </label>
  );
}

/* =====================
 * Compound Radio
 * ===================== */
type CompoundRadio = {
  (props: RadioProps & { name: string; checked?: boolean }): JSX.Element;
  Group: (props: RadioGroupProps) => JSX.Element;
  Option: (
    props: RadioProps & { groupValue?: string; onGroupChange?: (value: string) => void }
  ) => JSX.Element;
};

const Radio = ((props: RadioProps & { name: string; checked?: boolean }) => (
  <BaseRadio {...props} />
)) as CompoundRadio;

/* =====================
 * Radio Group
 * ===================== */
Radio.Group = function RadioGroup({
  name,
  value: groupValue,
  onChange,
  disabled,
  children,
}: RadioGroupProps) {
  return (
    <div role="radiogroup" aria-disabled={disabled}>
      {Array.isArray(children)
        ? children.map((child: ReactElement<RadioProps> | null) =>
            child ? (
              <child.type
                key={child.props.value}
                {...child.props}
                groupValue={groupValue}
                onGroupChange={onChange}
                disabled={disabled || child.props.disabled}
              />
            ) : null
          )
        : children}
    </div>
  );
};

/* =====================
 * Radio Option
 * ===================== */
Radio.Option = function RadioOption({
  value,
  children,
  groupValue,
  onGroupChange,
  size = "normal",
  disabled = false,
  ...props
}: RadioProps & { groupValue?: string; onGroupChange?: (value: string) => void }) {
  const isChecked = groupValue === value;

  const handleChange = () => {
    if (disabled) return;
    onGroupChange?.(value);
  };

  return (
    <BaseRadio
      value={value}
      size={size}
      checked={isChecked}
      disabled={disabled}
      onChange={handleChange}
      {...props}
    >
      {children}
    </BaseRadio>
  );
};

export default Radio;
