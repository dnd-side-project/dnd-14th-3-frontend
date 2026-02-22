import { useState } from "react";

import { Controller, useFormContext } from "react-hook-form";

import { ProfileSetupFormValues, profileSubmitSchema } from "@/types/on-board";

import { logger } from "@/lib/shared/logger";

import { FIELD_TO_STEP } from "@/constants/on-board";

import { Toast } from "@/store/shared/toast/toast.store";

import { useProfileFunnel } from "@/hooks/on-board";

import { useSubmitProfile } from "@/queries/user";

import { TextArea } from "@/components/shared/textarea";

import ProfileStepLayout from "../ProfileStepLayout";

const MAX_LENGTH = 100;

interface IntroductionStepProps {
  onComplete: () => void;
}

export default function IntroductionStep({ onComplete }: IntroductionStepProps) {
  const { control, getValues } = useFormContext<ProfileSetupFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setStep, goBack, isFirstStep, isLastStep, canGoNext } = useProfileFunnel();

  const { mutateAsync: submitProfile, isPending } = useSubmitProfile();

  const handleSubmit = async () => {
    const data = getValues();
    const validation = profileSubmitSchema.safeParse(data);

    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      const message = firstIssue?.message ?? "유효성 검증 실패";
      Toast.show({ type: "error", message });
      logger.error(message);
      const firstField = firstIssue?.path[0];
      if (typeof firstField === "string" && firstField in FIELD_TO_STEP) {
        setStep(FIELD_TO_STEP[firstField as keyof ProfileSetupFormValues]);
      }
      return;
    }
    setIsSubmitting(true);
    try {
      await submitProfile(validation.data);
      Toast.show({
        type: "success",
        message: "프로필이 정상적으로 완성되었어요!",
      });
      onComplete();
    } catch (error) {
      Toast.show({
        type: "error",
        message: error instanceof Error ? error.message : "프로필 저장에 실패했습니다",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProfileStepLayout
      title="자기소개를 입력해주세요."
      description={"매칭 시 상대에게 공개돼요.\n편하게 나를 표현해보세요"}
      hideDefaultFooter={false}
      canGoNext={canGoNext && !isSubmitting && !isPending}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      nextLabel={isSubmitting || isPending ? "프로필 저장 중..." : "프로필 완성"}
      onNext={handleSubmit}
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
