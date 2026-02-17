import { useState } from "react";

import type { Meta } from "@storybook/react-vite";

import { Popup } from "./index";
import TriggerWrapper, {
  type Story,
  type StoryArgs,
  StoryTriggerButton,
} from "./Popup.story-shared";

const meta = {
  title: "shared/Popup",
  component: Popup,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "## Popup\n\n" +
          "Centered dialog with title, content, and optional confirm/cancel actions.\n\n" +
          "- `title`: rendered as `h2`\n" +
          "- `content`: rendered as body text\n" +
          "- `showConfirm`, `showCancel`: toggle each action button\n" +
          "- `confirmMessage`, `cancelMessage`: action labels",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: { control: false },
    onClose: { action: "close" },
    onConfirm: { action: "confirm" },
    onCancel: { action: "cancel" },
    title: { control: "text" },
    content: { control: "text" },
    confirmMessage: { control: "text" },
    cancelMessage: { control: "text" },
    showConfirm: { control: "boolean" },
    showCancel: { control: "boolean" },
    closeOnBackdrop: { control: "boolean" },
  },
  args: {
    title: "Delete item",
    content: "This action cannot be undone.",
    confirmMessage: "Confirm",
    cancelMessage: "Cancel",
    showConfirm: true,
    showCancel: true,
    closeOnBackdrop: true,
  },
} satisfies Meta<typeof Popup>;

export default meta;

/**
 * Basic playground for popup props.
 * Scenario-specific flows are in `shared/Popup/Scenarios`.
 */
export const Default: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <TriggerWrapper>
        <StoryTriggerButton onClick={() => setIsOpen(true)}>Open Popup</StoryTriggerButton>
        <Popup
          {...args}
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            args.onClose?.();
          }}
          onConfirm={() => {
            setIsOpen(false);
            args.onConfirm?.();
          }}
          onCancel={() => {
            setIsOpen(false);
            args.onCancel?.();
          }}
        />
      </TriggerWrapper>
    );
  },
  args: {
    showConfirm: true,
    showCancel: true,
  } satisfies StoryArgs,
};
