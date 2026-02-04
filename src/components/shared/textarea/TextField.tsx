import type { TextareaHTMLAttributes } from "react";
import { useState } from "react";

/* =====================
 * Types
 * ===================== */
type TextFieldStatus = "default" | "error" | "disabled";

interface TextFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "disabled"> {
  status?: TextFieldStatus;
  caption?: string;
}

/* =====================
 * Styles
 * ===================== */
const statusStyles = {
  default: "border-gray-300 focus:border-mint-500 focus:ring-mint-500",
  error: "border-warning-500 focus:border-warning-500 focus:ring-warning-500",
  disabled: "border-gray-100 text-gray-400 cursor-not-allowed",
};

/* =====================
 * TextField Component
 * ===================== */
function TextField({ status = "default", caption, className = "", ...rest }: TextFieldProps) {
  const [value, setValue] = useState(rest.defaultValue || "");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    rest.onChange?.(e);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <textarea
        className={`w-full rounded-md border p-3 text-base transition-colors duration-200 focus:outline-none ${statusStyles[status]}`}
        value={value}
        disabled={status === "disabled"}
        onChange={handleChange}
        {...rest}
      />
      {caption && (
        <span
          className={`text-caption-2 ${status === "error" ? "text-warning-500" : status === "disabled" ? "text-gray-600" : "text-black"}`}
        >
          {caption}
        </span>
      )}
    </div>
  );
}

export default TextField;
