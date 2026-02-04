import type { Meta, StoryObj } from "@storybook/react-vite";

import Checkbox from "./Checkbox";

const meta: Meta<typeof Checkbox.Primary> = {
  title: "shared/Checkbox/Primary",
  component: Checkbox.Primary,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## Checkbox.Primary
- 기본 사각형 체크박스입니다.
- 상위 위계로 활성화 여부를 제어할 때 사용합니다.
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
    children: "기본 체크박스",
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox.Primary>;

export const Default: Story = {
  args: {},
};

export const Partial: Story = {
  args: { state: "partial" },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox.Primary state="checked" disabled>
        비활성 체크
      </Checkbox.Primary>
      <Checkbox.Primary state="partial" disabled>
        비활성 부분
      </Checkbox.Primary>
      <Checkbox.Primary state="unchecked" disabled>
        비활성 미체크
      </Checkbox.Primary>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox.Primary size="normal">Normal</Checkbox.Primary>
      <Checkbox.Primary size="small">Small</Checkbox.Primary>
    </div>
  ),
};
