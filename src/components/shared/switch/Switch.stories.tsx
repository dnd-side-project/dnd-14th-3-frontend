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
      control: "boolean",
    },
    defaultChecked: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    label: {
      control: "text",
      description: "스위치 라벨",
    },
  },
  args: {
    size: "normal",
    defaultChecked: true,
    disabled: false,
    label: "스위치 라벨",
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

/* =====================
 * Stories
 * ===================== */

export const Default: Story = {
  args: {},
};

export const Off: Story = {
  args: {
    defaultChecked: false,
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Switch defaultChecked disabled label="비활성 ON" />
      <Switch defaultChecked={false} disabled label="비활성 OFF" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch size="normal" defaultChecked label="Normal" />
      <Switch size="small" defaultChecked label="Small" />
    </div>
  ),
};

export const NoLabel: Story = {
  render: () => (
    <div className="flex gap-4">
      <Switch defaultChecked />
      <Switch size="small" />
    </div>
  ),
};
