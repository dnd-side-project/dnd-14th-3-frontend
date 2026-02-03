import type { Meta, StoryObj } from "@storybook/react-vite";
import Checkbox from "./Checkbox";

const meta: Meta<typeof Checkbox.Check> = {
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
    },
    state: {
      control: "select",
      options: ["checked", "unchecked"],
    },
    disabled: {
      control: "boolean",
    },
    children: {
      control: "text",
      description: "라벨 텍스트",
    },
  },
  args: {
    size: "normal",
    state: "checked",
    disabled: false,
    children: "체크박스 라벨",
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox.Check>;

export const Default: Story = {
  args: {},
};

export const Unchecked: Story = {
  args: { state: "unchecked" },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox.Check state="checked" disabled>
        비활성 체크
      </Checkbox.Check>
      <Checkbox.Check state="unchecked" disabled>
        비활성 미체크
      </Checkbox.Check>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox.Check size="normal">Normal</Checkbox.Check>
      <Checkbox.Check size="small">Small</Checkbox.Check>
    </div>
  ),
};
