import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import SegmentedControl from "./SegmentedControl";

const meta = {
	title: "companion-reservation/SegmentedControl",
	component: SegmentedControl,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"동행과 내 동행 탭을 전환하는 세그먼트 컨트롤 컴포넌트입니다.",
			},
		},
	},
	argTypes: {
		activeTab: {
			control: "select",
			options: ["browse", "mine"],
			description: "현재 활성화된 탭",
		},
		onTabChange: {
			action: "tab changed",
			description: "탭 변경 핸들러",
		},
	},
	args: {
		onTabChange: (tab) => {
			console.log("Tab changed to:", tab);
		},
	},
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => {
		const [activeTab, setActiveTab] = useState<"browse" | "mine">("browse");
		return (
			<SegmentedControl activeTab={activeTab} onTabChange={setActiveTab} />
		);
	},
	args: {
		activeTab: "browse",
	},
};
