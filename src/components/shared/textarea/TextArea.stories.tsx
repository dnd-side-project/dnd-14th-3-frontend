import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/internal/preview-api";

import TextArea from "./TextArea";

const meta: Meta<typeof TextArea> = {
  title: "shared/TextArea",
  component: TextArea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## TextArea
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
};

export default meta;
type Story = StoryObj<typeof TextArea>;

/* =====================
 * Stories
 * ===================== */
export const Default: Story = {
  render: (args) => {
    const [, updateArgs] = useArgs();

    return (
      <TextArea
        {...args}
        onChange={(value) => {
          updateArgs({ value });
        }}
      />
    );
  },
  args: {
    value: "",
    placeholder: "여기에 입력하세요",
  },
};

export const Error: Story = {
  render: (args) => {
    const [value, setValue] = useState("잘못된 값");

    return (
      <TextArea
        {...args}
        value={value}
        onChange={setValue}
        status="error"
        caption="오류가 발생했습니다"
      />
    );
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value] = useState("기본값");

    return (
      <TextArea
        {...args}
        value={value}
        onChange={() => {}}
        status="disabled"
        caption="편집할 수 없습니다"
      />
    );
  },
};

export const NoCaption: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return <TextArea value={value} onChange={setValue} placeholder="캡션 없음" />;
  },
};
