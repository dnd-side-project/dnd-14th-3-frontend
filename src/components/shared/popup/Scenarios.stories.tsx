import { useState } from "react";

import type { Meta } from "@storybook/react-vite";

import { Popup } from "./index";
import TriggerWrapper, { type Story, StoryTriggerButton } from "./Popup.story-shared";

const meta = {
  title: "shared/Popup/Scenarios",
  component: Popup,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Common popup usage scenarios: default confirm/cancel, confirm-only, no-buttons notice, custom labels, and strict backdrop close behavior.",
      },
    },
  },
} satisfies Meta<typeof Popup>;

export default meta;

export const Scenario1_DefaultFlow: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <TriggerWrapper>
        <StoryTriggerButton onClick={() => setIsOpen(true)}>Scenario 1</StoryTriggerButton>
        <Popup
          isOpen={isOpen}
          title="Leave this page?"
          content="Unsaved changes may be lost."
          confirmMessage="Leave"
          cancelMessage="Stay"
          onClose={() => setIsOpen(false)}
          onConfirm={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </TriggerWrapper>
    );
  },
};

export const Scenario2_ConfirmOnly: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <TriggerWrapper>
        <StoryTriggerButton onClick={() => setIsOpen(true)}>Scenario 2</StoryTriggerButton>
        <Popup
          isOpen={isOpen}
          title="Session expired"
          content="Please sign in again to continue."
          confirmMessage="Sign in"
          showCancel={false}
          onClose={() => setIsOpen(false)}
          onConfirm={() => setIsOpen(false)}
        />
      </TriggerWrapper>
    );
  },
};

export const Scenario3_NoButtonsNotice: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <TriggerWrapper>
        <StoryTriggerButton onClick={() => setIsOpen(true)}>Scenario 3</StoryTriggerButton>
        <Popup
          isOpen={isOpen}
          title="Processing"
          content="Please wait while we complete your request."
          showConfirm={false}
          showCancel={false}
          onClose={() => setIsOpen(false)}
        />
      </TriggerWrapper>
    );
  },
};

export const Scenario4_CustomLabels: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <TriggerWrapper>
        <StoryTriggerButton onClick={() => setIsOpen(true)}>Scenario 4</StoryTriggerButton>
        <Popup
          isOpen={isOpen}
          title="Delete post"
          content="Deleted posts cannot be restored."
          confirmMessage="Delete"
          cancelMessage="Back"
          onClose={() => setIsOpen(false)}
          onConfirm={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </TriggerWrapper>
    );
  },
};

export const Scenario5_NoBackdropClose: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <TriggerWrapper>
        <StoryTriggerButton onClick={() => setIsOpen(true)}>Scenario 5</StoryTriggerButton>
        <Popup
          isOpen={isOpen}
          title="Critical confirmation"
          content="You must choose an explicit action."
          closeOnBackdrop={false}
          confirmMessage="Proceed"
          cancelMessage="Cancel"
          onClose={() => setIsOpen(false)}
          onConfirm={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </TriggerWrapper>
    );
  },
};
