import type { Meta, StoryObj } from "@storybook/react-vite";

import Toast from "./Toast";

const meta: Meta<typeof Toast> = {
  title: "shared/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## Toast
- 사용자에게 알림 메시지를 표시하는 토스트 컴포넌트입니다.

[Figma 링크](https://www.figma.com/design/z8WjEo3rhBbmTzGszMvlJz/DND3%EC%A1%B0-%EC%A7%84%EC%A7%9C-?node-id=353-5835&m=dev)
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    message: {
      control: "text",
      description: "표시할 메시지",
    },
    type: {
      control: "select",
      options: ["info", "success", "error", "warning"],
      description: "토스트 타입",
    },
    offsetY: {
      control: { type: "number", min: 0, step: 4 },
      description: "아래에서 위로 올리는 오프셋(px)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  args: {
    message: "text",
    type: "info",
    offsetY: 0,
  },
};

export const LongMessage: Story = {
  args: {
    message: "저장이 완료되었습니다. 변경 사항이 반영되었어요.",
    type: "success",
    offsetY: 0,
  },
};

export const Types: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Toast message="정보 메시지" type="info" />
      <Toast message="성공 메시지" type="success" />
      <Toast message="오류 메시지" type="error" />
      <Toast message="경고 메시지" type="warning" />
    </div>
  ),
};
