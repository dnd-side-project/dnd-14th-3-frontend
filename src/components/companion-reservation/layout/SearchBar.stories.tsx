import type { Meta, StoryObj } from "@storybook/react-vite";

import SearchBar from "./SearchBar";

const meta = {
  title: "companion-reservation/SearchBar",
  component: SearchBar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "지역이나 키워드로 동행을 검색하는 검색 바 컴포넌트입니다.",
      },
    },
  },
  argTypes: {
    defaultValue: {
      control: "text",
      description: "초기 검색어",
    },
    onChange: {
      action: "search value changed (debounced)",
      description: "debounce된 검색어 변경 핸들러",
    },
    placeholder: {
      control: "text",
      description: "플레이스홀더 텍스트",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  args: {
    onChange: (value: string) => {
      console.log("Search value:", value);
    },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithValue: Story = {
  args: {
    defaultValue: "홍대",
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: "검색어를 입력하세요",
  },
};

export const Interactive: Story = {
  render: (args) => <SearchBar {...args} />,
  args: {},
};
