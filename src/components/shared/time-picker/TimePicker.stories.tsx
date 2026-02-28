import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import TimePicker from "./TimePicker";

const meta: Meta<typeof TimePicker> = {
  title: "shared/TimePicker",
  component: TimePicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## TimePicker
- 12시간제(AM/PM)로 시간을 선택하는 UI 컴포넌트입니다.
- 위/아래 화살표로 시·분을 조절하고, AM/PM을 클릭해 전환할 수 있습니다.

[Figma 링크](https://www.figma.com/design/z8WjEo3rhBbmTzGszMvlJz/DND3%EC%A1%B0?node-id=638-16343)
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

/* =====================
 * Stories
 * ===================== */

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    });

    return <TimePicker {...args} value={value} onChange={setValue} />;
  },
};

export const PM: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(() => {
      const d = new Date();
      d.setHours(14, 30, 0, 0);
      return d;
    });

    return <TimePicker {...args} value={value} onChange={setValue} />;
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value] = useState<Date | null>(() => {
      const d = new Date();
      d.setHours(9, 15, 0, 0);
      return d;
    });

    return <TimePicker {...args} value={value} onChange={() => {}} disabled />;
  },
};
