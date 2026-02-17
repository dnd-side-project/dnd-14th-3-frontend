import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, ReactNode } from "react";

import type { Modal } from "./index";

export type StoryArgs = Partial<
  Omit<ComponentProps<typeof Modal>, "isOpen" | "onClose" | "onConfirm" | "onCancel">
>;

export type Story = StoryObj<Meta<typeof Modal> & { args?: StoryArgs }>;

export default function TriggerWrapper({ children }: { children: ReactNode }) {
  return <div className="flex min-h-[80vh] items-center justify-center p-4">{children}</div>;
}

export const TRIGGER_BUTTON_CLASS =
  "rounded-lg bg-mint-500 px-4 py-2 font-medium text-black transition-colors hover:bg-mint-600";

export function StoryTriggerButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={TRIGGER_BUTTON_CLASS}>
      {children}
    </button>
  );
}
