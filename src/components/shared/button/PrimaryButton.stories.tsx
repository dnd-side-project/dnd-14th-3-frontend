import type { Meta, StoryObj } from "@storybook/react-vite";

import Button from "./Button";

const meta = {
  title: "shared/Button/Primary",
  component: Button.Primary,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## Button.Primary

- 가장 중요한 행동에 사용합니다.
- 아이콘과 함께 사용할 수 있습니다.

[Figma 링크](https://www.figma.com/design/z8WjEo3rhBbmTzGszMvlJz/DND3%EC%A1%B0-%EC%A7%84%EC%A7%9C-?node-id=278-1495&t=hc0aZHjOW81jceen-4)
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["large", "medium", "small"],
      description: "버튼 크기",
      table: { defaultValue: { summary: "large" } },
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
      table: { defaultValue: { summary: "false" } },
    },
    children: {
      control: "text",
      description: "버튼 라벨",
    },
    leftIcon: { control: false },
    rightIcon: { control: false },
  },
  args: {
    children: "Label",
    size: "large",
    disabled: false,
  },
} satisfies Meta<typeof Button.Primary>;

export default meta;
type Story = StoryObj<typeof meta>;

const PlaceholderIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none">
    <rect
      x="2"
      y="2"
      width="16"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="3 2"
    />
  </svg>
);

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Button.Primary size="large">Large</Button.Primary>
      <Button.Primary size="medium">Medium</Button.Primary>
      <Button.Primary size="small">Small</Button.Primary>
    </div>
  ),
};
export const WithLeftIcon: Story = {
  args: { leftIcon: <PlaceholderIcon /> },
};
export const WithRightIcon: Story = {
  args: { rightIcon: <PlaceholderIcon /> },
};
export const WithBothIcons: Story = {
  args: {
    leftIcon: <PlaceholderIcon />,
    rightIcon: <PlaceholderIcon />,
  },
};
