import type { ImgHTMLAttributes } from "react";

export type WarnCircleIconProps = ImgHTMLAttributes<HTMLImageElement>;

export default function WarnCircleIcon({
  alt = "경고",
  className,
  ...props
}: WarnCircleIconProps) {
  return (
    <img
      src="/icons/warn-circle.svg"
      alt={alt}
      className={className}
      {...props}
    />
  );
}
