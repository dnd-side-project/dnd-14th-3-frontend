import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import Switch from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "shared/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## Switch
- ON / OFF 상태를 토글하는 스위치 컴포넌트입니다.
- 활성화 여부를 제어할 때 사용합니다.

[Figma 링크](https://www.figma.com/design/z8WjEo3rhBbmTzGszMvlJz/DND3%EC%A1%B0-%EC%A7%84%EC%A7%9C-?node-id=273-1114&t=rn1IDUEINPlQH5sD-4/)
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["normal", "small"],
    },
    checked: {
      control: false,
    },
    disabled: {
      control: "boolean",
    },
    label: {
      control: "text",
      description: "스위치 라벨",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

/* =====================
 * Stories
 * ===================== */

export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(true);

    return <Switch {...args} checked={checked} onChange={(e) => setChecked(e.target.checked)} />;
  },
  args: {
    size: "normal",
    label: "스위치 라벨",
  },
};

export const Off: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false);

    return <Switch {...args} checked={checked} onChange={(e) => setChecked(e.target.checked)} />;
  },
  args: {
    label: "OFF 상태",
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Switch checked disabled label="비활성 ON" />
      <Switch checked={false} disabled label="비활성 OFF" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => {
    const [normal, setNormal] = useState(true);
    const [small, setSmall] = useState(false);

    return (
      <div className="flex flex-col gap-4">
        <Switch
          size="normal"
          checked={normal}
          onChange={(e) => setNormal(e.target.checked)}
          label="Normal"
        />
        <Switch
          size="small"
          checked={small}
          onChange={(e) => setSmall(e.target.checked)}
          label="Small"
        />
      </div>
    );
  },
};

export const NoLabel: Story = {
  render: () => {
    const [a, setA] = useState(true);
    const [b, setB] = useState(false);

    return (
      <div className="flex gap-4">
        <Switch checked={a} onChange={(e) => setA(e.target.checked)} />
        <Switch size="small" checked={b} onChange={(e) => setB(e.target.checked)} />
      </div>
    );
  },
};
