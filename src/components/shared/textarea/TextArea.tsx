import type { ChangeEvent,TextareaHTMLAttributes } from "react";

/* =====================
 * Types
 * ===================== */
type TextAreaStatus = "default" | "error" | "disabled";

export interface TextAreaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "disabled" | "value" | "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  status?: TextAreaStatus;
  caption?: string;
  className?: string;
}

/* =====================
 * Styles
 * ===================== */
const statusStyles: Record<TextAreaStatus, string> = {
  default: "border-gray-300 focus:border-mint-500 focus:ring-mint-500",
  error: "border-warning-500 focus:border-warning-500 focus:ring-warning-500",
  disabled: "border-gray-100 text-gray-400 cursor-not-allowed",
};

/* =====================
 * TextArea Component
 * ===================== */
function TextArea({
  value,
  onChange,
  status = "default",
  caption,
  className = "",
  ...props
}: TextAreaProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (status === "disabled") return;
    onChange(e.target.value);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <textarea
        value={value}
        disabled={status === "disabled"}
        onChange={handleChange}
        className={`w-full rounded-md border p-3 text-base transition-colors duration-200 focus:outline-none ${statusStyles[status]}`}
        {...props}
      />
      {caption && (
        <span
          className={`text-caption-2 ${
            status === "error"
              ? "text-warning-500"
              : status === "disabled"
                ? "text-gray-600"
                : "text-black"
          }`}
        >
          {caption}
        </span>
      )}
    </div>
  );
}

export default TextArea;
