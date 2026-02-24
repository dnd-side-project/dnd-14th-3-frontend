import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentType } from "react";

import NotificationPermissionWidget from "./NotificationPermissionWidget";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});

const meta = {
  title: "on-board/NotificationPermission",
  component: NotificationPermissionWidget,
  decorators: [
    (Story: ComponentType) => (
      <QueryClientProvider client={queryClient}>
        <div className="flex h-dvh w-full flex-col bg-white">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "온보딩 알림 권한 요청 화면.",
          "",
          "- useNotificationPermission 훅으로 실제 권한 요청·isRequesting 연동",
          "- **알림 거절(denied) 시**: 안내 팝업 노출",
          "- 알림 미지원 시: consent 저장 후 onComplete 자동 호출",
          "- 알림 허용하기 / 다음에 할게요 선택 시 onComplete 호출",
        ].join("\n"),
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onComplete: { action: "onComplete", description: "알림 허용/스킵/미지원 시 완료 콜백" },
  },
  args: {
    onComplete: () => {
      window.alert("온보딩 완료");
    },
  },
} satisfies Meta<typeof NotificationPermissionWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본 (실제 권한 요청, 닉네임은 서버 프로필에서 조회) */
export const Default: Story = {};
