import type { Meta, StoryObj } from "@storybook/react-vite";

import { INTRO_STEPS } from "@/constants/on-board";

import IntroPager from "./IntroPager";

const meta = {
  title: "on-board/IntroPager",
  component: IntroPager,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "인트로 슬라이드 페이저. 스와이프·휠·방향키로 이동 가능. `steps`는 외부에서 주입합니다.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    steps: {
      description: "인트로 단계 목록 (이미지, 제목, 설명, 마지막 단계 CTA 라벨)",
      table: {
        type: { summary: "IntroStepContent[]" },
      },
    },
    onComplete: {
      action: "onComplete",
      description: "마지막 단계에서 CTA 클릭 시 호출",
    },
  },
  args: {
    steps: INTRO_STEPS,
  },
} satisfies Meta<typeof IntroPager>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    steps: INTRO_STEPS,
    onComplete: () => { window.alert("onComplete"); },
  },
};
