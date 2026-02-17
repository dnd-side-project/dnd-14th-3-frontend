import type { Meta, StoryObj } from "@storybook/react-vite";

import ChipButton from "./ChipButton";

const meta = {
  title: "shared/ChipButton",
  component: ChipButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## ChipButton

- 선택/필터 등 토글 가능한 칩 형태 버튼입니다.
- **selected**: mint(primary) 배경
- **default**: 회색 배경

[Figma 링크](https://www.figma.com/design/z8WjEo3rhBbmTzGszMvlJz/DND3%EC%A1%B0?node-id=336-7337&m=dev)
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    selected: {
      control: "boolean",
      description: "선택(활성) 상태",
      table: { defaultValue: { summary: "false" } },
    },
    size: {
      control: "select",
      options: ["medium", "small"],
      description: "칩 크기",
      table: { defaultValue: { summary: "medium" } },
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
      table: { defaultValue: { summary: "false" } },
    },
    children: {
      control: "text",
      description: "칩 라벨",
    },
  },
  args: {
    children: "칩 라벨",
    selected: false,
    size: "medium",
    disabled: false,
  },
} satisfies Meta<typeof ChipButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
export const Disabled: Story = { args: { disabled: true } };
export const SelectedDisabled: Story = { args: { selected: true, disabled: true } };

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <ChipButton size="medium">Medium</ChipButton>
      <ChipButton size="medium" selected>
        Medium Selected
      </ChipButton>
      <ChipButton size="small">Small</ChipButton>
      <ChipButton size="small" selected>
        Small Selected
      </ChipButton>
    </div>
  ),
};

export const ChipGroup: Story = {
  render: () => {
    const options = ["전체", "진행중", "완료", "보류"];
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((label, i) => (
          <ChipButton key={label} selected={i === 1}>
            {label}
          </ChipButton>
        ))}
      </div>
    );
  },
};
