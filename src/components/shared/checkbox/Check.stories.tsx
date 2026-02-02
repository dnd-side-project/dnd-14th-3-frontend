import type { Meta, StoryObj } from "@storybook/react-vite";
import Checkbox from "./Checkbox";

const meta = {
  title: "shared/Checkbox/Check",
  component: Checkbox.Check,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## Checkbox.Check

- 체크 아이콘만 표시되는 체크박스입니다.
- 낮은 위계로 활성화 여부를 제어할 때 사용합니다.

[Figma 링크](https://www.figma.com/design/z8WjEo3rhBbmTzGszMvlJz/DND3%EC%A1%B0-%EC%A7%84%EC%A7%9C-?node-id=273-956&t=d7jqXQPLZtCUdNyo-4)
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["normal", "small"],
      description: "체크박스 크기",
      table: { defaultValue: { summary: "normal" } },
    },
    state: {
      control: "select",
      options: ["checked", "unchecked"],
      description: "체크 상태 (partial 미지원)",
      table: { defaultValue: { summary: "checked" } },
    },
    disabled: {
      control: "boolean",
      description: "비활성화 여부",
      table: { defaultValue: { summary: "false" } },
    },
  },
  args: {
    size: "normal",
    state: "checked",
    disabled: false,
  },
} satisfies Meta<typeof Checkbox.Check>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: { state: "checked" },
};

export const Unchecked: Story = {
  args: { state: "unchecked" },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-4">
      <Checkbox.Check state="checked" disabled />
      <Checkbox.Check state="unchecked" disabled />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Checkbox.Check state="checked" size="normal" />
      <Checkbox.Check state="checked" size="small" />
    </div>
  ),
};
