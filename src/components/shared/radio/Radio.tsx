import {
  ChangeEvent,
  Children,
  cloneElement,
  InputHTMLAttributes,
  isValidElement,
  ReactElement,
  ReactNode,
} from "react";

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

/* Option 전용 props */
type RadioOptionProps = RadioProps & {
  name: string;
  groupValue?: string;
  onGroupChange?: (value: string) => void;
};

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
}: RadioProps & { name: string; checked?: boolean }) {
  const isChecked = checked || state === "checked";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onChange?.(e.target.value);
  };

  const sizeClass =
    size === "small" ? "w-[14px] h-[14px] border-[4.5px]" : "w-[20px] h-[20px] border-6";

  return (
    <label
      className={`inline-flex items-center gap-2 ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
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
        className={`flex items-center justify-center rounded-full border bg-white
          ${
            disabled
              ? isChecked
                ? "border-mint-100"
                : "border-gray-100"
              : isChecked
                ? "border-mint-500"
                : "border-gray-300"
          }
          ${sizeClass}`}
      />
      {children && <span>{children}</span>}
    </label>
  );
}

/* =====================
 * Radio (default)
 * ===================== */
function Radio(props: RadioProps & { name: string; checked?: boolean }) {
  return <BaseRadio {...props} />;
}

/* =====================
 * Declaration Merging
 * ===================== */
interface Radio {
  Group: (props: RadioGroupProps) => JSX.Element;
  Option: (props: RadioOptionProps) => JSX.Element;
}

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
      {Children.map(children, (child) => {
        if (!isValidElement<RadioOptionProps>(child)) return null;

        return cloneElement(child, {
          name,
          groupValue,
          onGroupChange: onChange,
          disabled: disabled || child.props.disabled,
        });
      })}
    </div>
  );
};

/* =====================
 * Radio Option
 * ===================== */
Radio.Option = function RadioOption({
  name,
  value,
  children,
  groupValue,
  onGroupChange,
  size = "normal",
  disabled = false,
  ...props
}: RadioOptionProps) {
  const isChecked = groupValue === value;

  const handleChange = () => {
    if (disabled) return;
    onGroupChange?.(value);
  };

  return (
    <BaseRadio
      {...props}
      name={name}
      value={value}
      checked={isChecked}
      size={size}
      disabled={disabled}
      onChange={handleChange}
    >
      {children}
    </BaseRadio>
  );
};

export default Radio;
