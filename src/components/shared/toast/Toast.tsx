import { ToastType } from "@/types/shared/toast/toast.type";

interface ToastProps {
  message: string;
  type: ToastType;
  offsetY?: number;
}

// TODO: 토스트 스타일 추가
const toastStyles: Record<ToastType, string> = {
  info: "bg-gray-900/80",
  success: "bg-gray-900/80",
  error: "bg-gray-900/80",
  warning: "bg-gray-900/80",
};

export default function Toast({ message, type = "info", offsetY = 0 }: ToastProps) {
  return (
    <div
      className={`flex w-[335px] items-center justify-center rounded-md p-4 text-center ${toastStyles[type]}`}
      style={offsetY > 0 ? { transform: `translateY(-${offsetY}px)` } : undefined}
    >
      <span className="text-sm font-normal leading-[1.43] tracking-[1.45px] text-white">
        {message}
      </span>
    </div>
  );
}
