import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonSize = "large" | "medium" | "small";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼 라벨 텍스트 */
  children: ReactNode;
  /** 버튼 크기 */
  size?: ButtonSize;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 왼쪽 아이콘 */
  leftIcon?: ReactNode;
  /** 오른쪽 아이콘 */
  rightIcon?: ReactNode;
  /** 추가 클래스명 */
  className?: string;
}

const sizeStyles: Record<ButtonSize, string> = {
  large: "h-[52px] px-7 py-3 rounded-[var(--radius-l)] text-body-1 gap-1.5",
  medium: "px-5 py-2.5 rounded-[var(--radius-m)] text-body-2 gap-1",
  small: "px-3.5 py-1.5 rounded-[var(--radius-s)] text-label-2 gap-1",
};

const iconSizes: Record<ButtonSize, string> = {
  large: "size-5",
  medium: "size-[18px]",
  small: "size-4",
};

/**
 * Button/Solid/Primary
 *
 * - 중요한 행동에 사용합니다.
 * - 아이콘과 함께 사용할 수 있습니다.
 * - 가장 높은 시각 위계를 가집니다.
 *
 * @see Figma: https://www.figma.com/design/z8WjEo3rhBbmTzGszMvlJz/?node-id=278-1551
 */
function Button({
  children,
  size = "large",
  disabled = false,
  leftIcon,
  rightIcon,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-colors";

  const stateStyles = disabled
    ? "bg-gray-50 text-gray-500 cursor-not-allowed"
    : "bg-mint text-black hover:bg-mint-600 active:bg-mint-700";

  return (
    <button
      type="button"
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${stateStyles} ${className}`}
      {...props}
    >
      {leftIcon && <span className={`shrink-0 ${iconSizes[size]}`}>{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className={`shrink-0 ${iconSizes[size]}`}>{rightIcon}</span>}
    </button>
  );
}

export default Button;
