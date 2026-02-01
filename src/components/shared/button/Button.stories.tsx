import type { Meta, StoryObj } from "@storybook/react-vite";

import Button from "./Button";

const meta = {
  title: "shared/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## Button/Solid/Primary

- 중요한 행동에 사용합니다.
- 아이콘과 함께 사용할 수 있습니다.
- 가장 높은 시각 위계를 가집니다.

[Figma 링크](https://www.figma.com/design/z8WjEo3rhBbmTzGszMvlJz/?node-id=278-1551)
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
      table: {
        defaultValue: { summary: "large" },
      },
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    children: {
      control: "text",
      description: "버튼 라벨 텍스트",
    },
    leftIcon: {
      control: false,
      description: "왼쪽 아이콘",
    },
    rightIcon: {
      control: false,
      description: "오른쪽 아이콘",
    },
  },
  args: {
    children: "Label",
    size: "large",
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma 디자인 기반 Placeholder 아이콘 (점선 사각형)
function PlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
}

/** 기본 Large 버튼 */
export const Default: Story = {};

/** Large 사이즈 */
export const Large: Story = {
  args: {
    size: "large",
  },
};

/** Medium 사이즈 */
export const Medium: Story = {
  args: {
    size: "medium",
  },
};

/** Small 사이즈 */
export const Small: Story = {
  args: {
    size: "small",
  },
};

/** 비활성화 상태 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

/** 왼쪽 아이콘 */
export const WithLeftIcon: Story = {
  args: {
    leftIcon: <PlaceholderIcon />,
  },
};

/** 오른쪽 아이콘 */
export const WithRightIcon: Story = {
  args: {
    rightIcon: <PlaceholderIcon />,
  },
};

/** 양쪽 아이콘 */
export const WithBothIcons: Story = {
  args: {
    leftIcon: <PlaceholderIcon />,
    rightIcon: <PlaceholderIcon />,
  },
};

/** 모든 사이즈 비교 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <Button size="large">Label</Button>
      <Button size="medium">Label</Button>
      <Button size="small">Label</Button>
    </div>
  ),
};

/** 활성/비활성 상태 비교 */
export const States: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <Button size="large">Label</Button>
        <Button size="large" disabled>
          Label
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Button size="medium">Label</Button>
        <Button size="medium" disabled>
          Label
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Button size="small">Label</Button>
        <Button size="small" disabled>
          Label
        </Button>
      </div>
    </div>
  ),
};
