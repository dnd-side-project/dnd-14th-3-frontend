export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastConfig {
  type: ToastType;
  message: string;
  duration?: number;
  offsetY?: number;
}
