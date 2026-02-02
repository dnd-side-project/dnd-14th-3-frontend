import type { Meta, StoryObj } from "@storybook/react-vite";
import Checkbox from "./Checkbox";

const meta = {
  title: "shared/Checkbox/Primary",
  component: Checkbox.Primary,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## Checkbox.Primary

- 기본 사각형 체크박스입니다.
- 단일 선택 및 리스트 선택에 사용합니다.
- partial 상태는 하위 항목이 일부만 선택되었을 때 사용합니다.

[Figma 링크](https://www.figma.com/design/z8WjEo3rhBbmTzGszMvlJz/DND3%EC%A1%B0-%EC%A7%84%EC%A7%9C-?node-id=273-754&t=2bjfxe64oF1vS1cJ-4)
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
      options: ["checked", "unchecked", "partial"],
      description: "체크 상태",
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
} satisfies Meta<typeof Checkbox.Primary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: { state: "checked" },
};

export const Partial: Story = {
  args: { state: "partial" },
};

export const Unchecked: Story = {
  args: { state: "unchecked" },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-4">
      <Checkbox.Primary state="checked" disabled />
      <Checkbox.Primary state="partial" disabled />
      <Checkbox.Primary state="unchecked" disabled />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Checkbox.Primary state="checked" size="normal" />
      <Checkbox.Primary state="checked" size="small" />
    </div>
  ),
};
