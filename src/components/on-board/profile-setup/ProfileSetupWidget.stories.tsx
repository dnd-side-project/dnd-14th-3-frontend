import { useCallback, useEffect } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useFormContext } from "react-hook-form";

import type { AgeRange, Gender, ProfileSetupStep } from "@/types/on-board";
import { ProfileSetupFormValues, profileSubmitSchema } from "@/types/on-board";

import {
  ProfileSetupFormProvider,
  ProfileSetupStoreProvider,
  useProfileSetupStore,
} from "@/store/on-board/profile-setup-step";

import { ToastContainer, ToastPortal } from "@/components/shared/toast";

import ProfileSetupFunnel from "./ProfileSetupFunnel";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});

export interface ProfileSetupWidgetInitialState {
  /** 현재 보여줄 스텝 (Controls에서 변경 시 해당 단계로 이동) */
  initialStep: ProfileSetupStep;
  /** 닉네임 (이전 스텝 값) */
  newUsername: string;
  /** 성별 (이전 스텝 값) */
  gender: Gender | "";
  /** 나이대 (이전 스텝 값) */
  ageRange: AgeRange | "";
  /** 선호 촬영 스타일 ID 목록. 쉼표 구분 문자열로 입력 (예: UPPER_BODY_FOCUS,FULL_BODY) */
  preferredStyles: string;
  /** 자기소개 (이전 스텝 값) */
  introduction: string;
  onComplete: () => void;
}

function ProfileSetupDecorator(Story: React.ComponentType) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
      <ToastPortal />
      <Story />
    </QueryClientProvider>
  );
}

/** 스토리용: initialStep + 초기값으로 store를 채운 뒤 Widget 렌더. Controls에서 각 값을 입력해 단계별 UI를 확인할 수 있습니다. */
function ProfileSetupWidgetWithInitialState({
  initialStep,
  newUsername,
  gender,
  ageRange,
  preferredStyles,
  introduction,
  onComplete,
}: ProfileSetupWidgetInitialState) {
  const setStep = useProfileSetupStore((s) => s.setStep);
  const { setValue, getValues } = useFormContext<ProfileSetupFormValues>();

  const handleComplete = useCallback(() => {
    const data = getValues();
    const validation = profileSubmitSchema.safeParse(data);
    if (!validation.success) {
      return;
    }
    window.alert(JSON.stringify(data));
    onComplete();
  }, [getValues, onComplete]);

  useEffect(() => {
    setStep(initialStep);

    if (newUsername.trim()) setValue("newUsername", newUsername.trim());
    if (gender === "MALE" || gender === "FEMALE") setValue("gender", gender);
    if (ageRange) setValue("ageRange", ageRange as AgeRange);
    if (introduction.trim()) setValue("introduction", introduction.trim());

    const styleIds = preferredStyles
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (styleIds.length > 0) {
      setValue("preferredStyles", styleIds);
    }
  }, [
    initialStep,
    newUsername,
    gender,
    ageRange,
    preferredStyles,
    introduction,
    setStep,
    setValue,
  ]);

  return (
    <section className="flex min-h-dvh w-full flex-col">
      <ProfileSetupFunnel onComplete={handleComplete} />
    </section>
  );
}

function ProfileSetupWidgetWithProvider(
  props: ProfileSetupWidgetInitialState
) {
  return (
    <ProfileSetupStoreProvider>
      <ProfileSetupFormProvider>
        <ProfileSetupWidgetWithInitialState {...props} />
      </ProfileSetupFormProvider>
    </ProfileSetupStoreProvider>
  );
}

const meta = {
  title: "on-board/ProfileSetup",
  component: ProfileSetupWidgetWithProvider,
  decorators: [ProfileSetupDecorator],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "온보딩 프로필 설정 플로우. 하위 스토리로 **각 단계**를 지정할 수 있고, Controls에서 해당 스텝까지의 **초기값(입력)**을 바꿔가며 UI를 확인할 수 있습니다. MSW가 켜져 있으면 API가 모킹됩니다.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    initialStep: {
      control: "select",
      options: ["nickname", "gender", "age-range", "shooting-style", "introduction"] as const,
      description: "현재 보여줄 스텝",
    },
    newUsername: { control: "text", description: "닉네임 (이전 스텝 값)" },
    gender: {
      control: "select",
      options: ["", "MALE", "FEMALE"],
      description: "성별",
    },
    ageRange: {
      control: "select",
      options: ["", "10s", "20s", "30s", "40s", "50s", "60s", "over-70s"],
      description: "나이대",
    },
    preferredStyles: {
      control: "text",
      description: "선호 촬영 스타일 ID (쉼표 구분, 예: UPPER_BODY_FOCUS,FULL_BODY)",
    },
    introduction: { control: "text", description: "자기소개" },
    onComplete: { action: "onComplete", description: "프로필 완료 시 호출" },
  },
  args: {
    initialStep: "nickname",
    newUsername: "",
    gender: "",
    ageRange: "",
    preferredStyles: "",
    introduction: "",
    onComplete: () => window.alert("프로필 설정이 완료되었습니다."),
  },
} satisfies Meta<typeof ProfileSetupWidgetWithProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 전체 플로우 (처음부터 끝까지) */
export const Default: Story = {
  args: {
    initialStep: "nickname",
    newUsername: "",
    gender: "",
    ageRange: "",
    preferredStyles: "",
    introduction: "",
    onComplete: () => window.alert("프로필 설정이 완료되었습니다."),
  },
  render: (args) => <ProfileSetupWidgetWithProvider key={`${args.initialStep}-${args.newUsername}-${args.gender}`} {...args} />,
};

/** 닉네임 스텝만. Controls에서 newUsername 등 변경 가능 */
export const StepNickname: Story = {
  args: {
    initialStep: "nickname",
    newUsername: "",
    gender: "",
    ageRange: "",
    preferredStyles: "",
    introduction: "",
    onComplete: () => window.alert("프로필 설정이 완료되었습니다."),
  },
  render: (args) => <ProfileSetupWidgetWithProvider key={`${args.initialStep}-${args.newUsername}-${args.gender}`} {...args} />,
};

/** 성별 스텝. 이전 값(닉네임)을 입력해 두고 확인 */
export const StepGender: Story = {
  args: {
    initialStep: "gender",  
    newUsername: "테스트유저",
    gender: "",
    ageRange: "",
    preferredStyles: "",
    introduction: "",
    onComplete: () => window.alert("프로필 설정이 완료되었습니다."),
  },
  render: (args) => <ProfileSetupWidgetWithProvider key={`${args.initialStep}-${args.newUsername}-${args.gender}`} {...args} />,
};

/** 나이대 스텝. 닉네임·성별까지 채운 상태 */
export const StepAgeRange: Story = {
  args: {
    initialStep: "age-range",
    newUsername: "테스트유저",
    gender: "MALE",
    ageRange: "",
    preferredStyles: "",
    introduction: "",
    onComplete: () => window.alert("프로필 설정이 완료되었습니다."),
  },
  render: (args) => <ProfileSetupWidgetWithProvider key={`${args.initialStep}-${args.newUsername}-${args.gender}`} {...args} />,
};

/** 촬영 스타일 스텝. 그 이전 단계까지 채운 상태 */
export const StepShootingStyle: Story = {
  args: {
    initialStep: "shooting-style",
    newUsername: "테스트유저",
    gender: "MALE",
    ageRange: "20s",
    preferredStyles: "",
    introduction: "",
    onComplete: () => window.alert("프로필 설정이 완료되었습니다."),
  },
  render: (args) => <ProfileSetupWidgetWithProvider key={`${args.initialStep}-${args.newUsername}-${args.gender}`} {...args} />,
};

/** 자기소개 스텝. 선호 스타일까지 채운 상태 (완료 버튼으로 제출 가능) */
export const StepIntroduction: Story = {
  args: {
    initialStep: "introduction",
    newUsername: "테스트유저",
    gender: "MALE",
    ageRange: "20s",
    preferredStyles: "UPPER_BODY_FOCUS,FULL_BODY",
    introduction: "",
    onComplete: () => window.alert("프로필 설정이 완료되었습니다."),
  },
  render: (args) => <ProfileSetupWidgetWithProvider key={`${args.initialStep}-${args.newUsername}-${args.gender}`} {...args} />,
};
