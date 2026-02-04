import type { Meta, StoryObj } from "@storybook/react-vite";
import TextField from "./TextField";

const meta: Meta<typeof TextField> = {
  title: "shared/TextField",
  component: TextField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## TextField
- 입력 가능한 텍스트 영역 컴포넌트입니다.

[Figma 링크](https://www.figma.com/design/z8WjEo3rhBbmTzGszMvlJz/DND3%EC%A1%B0-%EC%A7%84%EC%A7%9C-?node-id=327-3238&t=rn1IDUEINPlQH5sD-4)
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["default", "error", "disabled"],
    },
    caption: {
      control: "text",
      description: "텍스트 필드 하단 캡션",
    },
    placeholder: {
      control: "text",
    },
  },
  args: {
    status: "default",
    caption: "설명이나 안내 문구",
    placeholder: "여기에 입력하세요",
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

/* =====================
 * Stories
 * ===================== */

export const Default: Story = {
  args: {},
};

export const Error: Story = {
  args: {
    status: "error",
    caption: "오류가 발생했습니다",
  },
};

export const Disabled: Story = {
  args: {
    status: "disabled",
    caption: "편집할 수 없습니다",
    defaultValue: "기본값",
  },
};

export const NoCaption: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TextField placeholder="캡션 없음" />
    </div>
  ),
};
