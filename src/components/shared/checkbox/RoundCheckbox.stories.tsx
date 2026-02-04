import type { Meta, StoryObj } from "@storybook/react-vite";

import Checkbox from "./Checkbox";

const meta: Meta<typeof Checkbox.Round> = {
  title: "shared/Checkbox/Round",
  component: Checkbox.Round,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## Checkbox.Round
- 원형 체크박스입니다.
- 보통 위계로 활성화 여부를 제어할 때 사용합니다.
- Primary와 동일한 state 규칙을 가집니다.

[Figma 링크](https://www.figma.com/design/z8WjEo3rhBbmTzGszMvlJz/DND3%EC%A1%B0-%EC%A7%84%EC%A7%9C-?node-id=273-855&t=2bjfxe64oF1vS1cJ-4)
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
      options: ["checked", "unchecked", "partial"],
    },
    disabled: {
      control: "boolean",
    },
    children: {
      control: "text",
    },
  },
  args: {
    size: "normal",
    state: "checked",
    disabled: false,
    children: "라운드 체크박스",
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox.Round>;

export const Default: Story = {
  args: {},
};

export const Unchecked: Story = {
  args: {
    state: "unchecked",
  },
};

export const Partial: Story = {
  args: {
    state: "partial",
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox.Round state="checked" disabled>
        비활성 체크
      </Checkbox.Round>
      <Checkbox.Round state="partial" disabled>
        비활성 부분 선택
      </Checkbox.Round>
      <Checkbox.Round state="unchecked" disabled>
        비활성 미선택
      </Checkbox.Round>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox.Round size="normal" state="checked">
        Normal
      </Checkbox.Round>
      <Checkbox.Round size="small" state="checked">
        Small
      </Checkbox.Round>
    </div>
  ),
};
