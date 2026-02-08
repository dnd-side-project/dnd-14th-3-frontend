import { createStore, useStore } from "zustand";

import { ToastConfig } from "@/types/shared/toast/toast.type";

interface ToastState {
  visible: boolean;
  toast: ToastConfig;
  hide: () => void;
}

export const toastStore = createStore<ToastState>((set) => ({
  visible: false,
  toast: {
    message: "",
    type: "success",
  },
  hide: () => set({ visible: false }),
}));

export const Toast = {
  show: ({ message, type = "success", duration = 5000 }: ToastConfig) => {
    toastStore.setState({
      toast: { message, type, duration },
      visible: true,
    });

    setTimeout(() => {
      toastStore.setState({ visible: false });
    }, duration);
  },
  hide: () => {
    toastStore.setState({ visible: false });
  },
};

export const useToast = () => useStore(toastStore);
