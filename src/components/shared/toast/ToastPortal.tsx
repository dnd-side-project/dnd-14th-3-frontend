import { useMemo } from "react";
import { createPortal } from "react-dom";

import { useToast } from "@/store/shared/toast/toast.store";

import Toast from "./Toast";

export default function ToastPortal() {
  const { toast, visible } = useToast();

  const container = useMemo(() => document.getElementById("toast-container"), []);

  if (!container) return null;

  return createPortal(visible ? <Toast {...toast} /> : null, container);
}
