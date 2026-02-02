import type { ButtonHTMLAttributes, ReactNode } from "react";

/* =====================
 * Types
 * ===================== */
type ButtonVariant = "primary" | "outlined" | "error";
type ButtonSize = "large" | "medium" | "small";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: ButtonSize;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

/* =====================
 * Styles
 * ===================== */
const buttonStyles = {
  primary: {
    base: "font-bold transition-colors",
    enabled: "bg-mint-500 text-black hover:bg-mint-600 active:bg-mint-700",
    disabled: "bg-gray-50 text-gray-500 cursor-not-allowed",
  },
  outlined: {
    base: "font-bold border transition-colors",
    enabled: "border-mint-500 text-black bg-transparent hover:bg-mint-50 active:bg-mint-100",
    disabled: "border-gray-50 text-gray-400 cursor-not-allowed",
  },
  error: {
    base: "font-bold border transition-colors",
    enabled:
      "border-warning-500 text-black bg-transparent hover:bg-warning-50 active:bg-warning-100",
    disabled: "border-warning-500 text-gray-400 cursor-not-allowed",
  },
} satisfies Record<ButtonVariant, { base: string; enabled: string; disabled: string }>;

const sizeStyles: Record<ButtonSize, string> = {
  large: "h-[48px] px-7 py-3 rounded-[var(--radius-l)] text-body-1 gap-1.5",
  medium: "px-5 py-2.5 rounded-[var(--radius-m)] text-body-2 gap-1",
  small: "px-3.5 py-1.5 rounded-[var(--radius-s)] text-label-2 gap-1",
};

const iconSizes: Record<ButtonSize, string> = {
  large: "size-5",
  medium: "size-[18px]",
  small: "size-4",
};

/* =====================
 * Base Button
 * ===================== */
function BaseButton({
  children,
  size = "large",
  variant = "primary",
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const variantStyle = buttonStyles[variant];

  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center ${
        variantStyle.base
      } ${sizeStyles[size]} ${disabled ? variantStyle.disabled : variantStyle.enabled} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {leftIcon && <span className={`shrink-0 ${iconSizes[size]}`}>{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className={`shrink-0 ${iconSizes[size]}`}>{rightIcon}</span>}
    </button>
  );
}

/* =====================
 * Compound Components
 * ===================== */
type CompoundButton = {
  (props: ButtonProps): JSX.Element;
  Primary: (props: Omit<ButtonProps, "variant">) => JSX.Element;
  Outlined: (props: Omit<ButtonProps, "variant">) => JSX.Element;
  Error: (props: Omit<ButtonProps, "variant">) => JSX.Element;
};

const Button = BaseButton as CompoundButton;

Button.Primary = (props) => <BaseButton {...props} variant="primary" />;
Button.Outlined = (props) => <BaseButton {...props} variant="outlined" />;
Button.Error = (props) => <BaseButton {...props} variant="error" />;

export default Button;
