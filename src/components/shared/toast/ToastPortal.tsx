import { createPortal } from "react-dom";

import { useToast } from "@/store/shared/toast/toast.store";

import Toast from "./Toast";

export default function ToastPortal() {
  const { toast, visible } = useToast();
  const container =
    typeof document !== "undefined" ? document.getElementById("toast-container") : null;

  if (!container) return null;

  return createPortal(visible ? <Toast {...toast} /> : null, container);
}
