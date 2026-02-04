import type { Meta, StoryObj } from "@storybook/react-vite";

import Radio from "./Radio";

const meta = {
  title: "shared/Radio",
  component: Radio,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## Radio

- 여러 항목 중 하나를 선택해야 할 때 사용합니다.
- Radio.Group / Radio.Option 형태로 조합해 사용할 수 있습니다.

[Figma 링크](https://www.figma.com/design/z8WjEo3rhBbmTzGszMvlJz/DND3%EC%A1%B0-%EC%A7%84%EC%A7%9C-?node-id=273-1033&t=d7jqXQPLZtCUdNyo-4)
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["normal", "small"],
      description: "라디오 버튼 크기",
    },
    state: {
      control: "select",
      options: ["checked", "unchecked"],
      description: "체크 상태",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 여부",
    },
  },
  args: {
    name: "radio",
    value: "radio",
    size: "normal",
    state: "checked",
    disabled: false,
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

/* =====================
 * Single Radio
 * ===================== */

export const Default: Story = {
  render: (args) => <Radio {...args}>Radio</Radio>,
};

export const Checked: Story = {
  args: {
    value: "checked",
    state: "checked",
  },
  render: (args) => <Radio {...args}>Checked</Radio>,
};

export const Unchecked: Story = {
  args: {
    value: "unchecked",
    state: "unchecked",
  },
  render: (args) => <Radio {...args}>Unchecked</Radio>,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <div className="flex gap-6">
      <Radio {...args} value="1" state="checked">
        Checked
      </Radio>
      <Radio {...args} value="2" state="unchecked">
        Unchecked
      </Radio>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-6">
      <Radio name="size" value="normal" size="normal" state="checked">
        Normal
      </Radio>
      <Radio name="size" value="small" size="small" state="checked">
        Small
      </Radio>
    </div>
  ),
};
