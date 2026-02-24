import { Controller, useFormContext } from "react-hook-form";

import type { ProfileSetupFormValues } from "@/types/on-board";

import { useProfileFunnel, useProfileSignup } from "@/hooks/on-board";

import { TextArea } from "@/components/shared/textarea";

import ProfileStepLayout from "../ProfileStepLayout";

const MAX_LENGTH = 100;

interface IntroductionStepProps {
  onComplete: () => void;
}

export default function IntroductionStep({ onComplete }: IntroductionStepProps) {
  const { control } = useFormContext<ProfileSetupFormValues>();
  const { goBack, isFirstStep, isLastStep, canGoNext } = useProfileFunnel();
  const { submit, isPending } = useProfileSignup(onComplete);

  return (
    <ProfileStepLayout
      title="자기소개를 입력해주세요."
      description={"매칭 시 상대에게 공개돼요.\n편하게 나를 표현해보세요"}
      hideDefaultFooter={false}
      canGoNext={canGoNext && !isPending}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      nextLabel={isPending ? "프로필 저장 중..." : "프로필 완성"}
      onNext={submit}
      onBack={goBack}
    >
      <div className="flex flex-col gap-2 grow">
        <h1 className="text-body-1 font-semibold text-gray-900">
          {"한 줄 자기소개"}
        </h1>

        <Controller
          control={control}
          name="introduction"
          render={({ field }) => (
            <TextArea
              value={field.value ?? ""}
              onChange={(value) => field.onChange(value.slice(0, MAX_LENGTH))}
              placeholder="자기소개를 입력해주세요"
              autoFocus
              rows={3}
            />
          )}
        />
      </div>
    </ProfileStepLayout>
  );
}
