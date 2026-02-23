import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentType } from "react";

import { NOTIFICATION_DENIED_GUIDE } from "@/constants/permission";

import { useNotificationPermission } from "@/hooks/on-board";

import { usePatchUserConsents } from "@/queries/user";

import { Popup } from "@/components/shared/popup";

import NotificationPermissionWidget from "./NotificationPermissionWidget";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});

interface StoryArgs {
  nickname?: string;
  onAllow?: () => void;
  onSkip?: () => void;
}

function NotificationPermissionWidgetWithLogic(args: StoryArgs) {
  const [showDeniedGuide, setShowDeniedGuide] = useState(false);
  const { requestPermission, isRequesting } = useNotificationPermission();
  const { mutateAsync: patchUserConsents } = usePatchUserConsents();

  const handleAllow = () => {
    requestPermission().then(async (result) => {
      if (result === "denied") {
        setShowDeniedGuide(true);
      } else {
        await patchUserConsents({
          notificationAllowed: true,
          locationAllowed: false,
        });
        args.onAllow?.();
      }
    }).catch(() => {
      window.alert("알림 권한 요청 실패");
    });
  };

  return (
    <div className="flex h-dvh w-full flex-col bg-white">
      <NotificationPermissionWidget
        nickname={args.nickname}
        onAllow={handleAllow}
        onSkip={() => args.onSkip?.()}
        isRequesting={isRequesting}
      />
      <Popup
        isOpen={showDeniedGuide}
        title={NOTIFICATION_DENIED_GUIDE.title}
        content={NOTIFICATION_DENIED_GUIDE.content}
        showCancel={false}
        confirmMessage="확인"
        onClose={() => setShowDeniedGuide(false)}
        onConfirm={() => {
          setShowDeniedGuide(false);
        }}
      />
    </div>
  );
}

const meta = {
  title: "on-board/NotificationPermission",
  component: NotificationPermissionWidgetWithLogic,
  decorators: [
    (Story: ComponentType) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "온보딩 알림 권한 요청 화면. useNotificationPermission 훅으로 실제 권한 요청·isRequesting이 연동됩니다. 알림 허용하기 / 다음에 할게요 선택 시 콜백이 호출됩니다.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    nickname: {
      control: "text",
      description: "환영 문구에 표시할 닉네임 (예: 사진수집가 → 사진수집가님, 가입을 축하드려요!)",
    },
    onAllow: { action: "onAllow", description: "알림 허용하기 완료 시" },
    onSkip: { action: "onSkip", description: "다음에 할게요 클릭 시" },
  },
  args: {
    nickname: "사진수집가",
    onAllow: () => {
      window.alert("알림 허용 완료");
    },
    onSkip: () => {
      window.alert("스킵 동작");
    },
  },
} satisfies Meta<typeof NotificationPermissionWidgetWithLogic>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본 (실제 권한 요청 + 닉네임) */
export const Default: Story = {};

/** 닉네임 없음 → "회원님, 가입을 축하드려요!" */
export const WithoutNickname: Story = {
  args: {
    nickname: undefined,
  },
};
