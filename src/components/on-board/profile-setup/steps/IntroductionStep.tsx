import { useState } from "react";

import { profileSubmitSchema } from "@/types/on-board";

import { logger } from "@/lib/shared/logger";

import { useProfileSetupStore } from "@/store/on-board/profile-setup.provider";
import { Toast } from "@/store/shared/toast/toast.store";

import { useProfileFunnel } from "@/hooks/on-board";

import { useSubmitProfile } from "@/queries/user";

import { Button } from "@/components/shared/button";
import { TextArea } from "@/components/shared/textarea";

import ProfileStepLayout from "../ProfileStepLayout";

const MAX_LENGTH = 100;

interface IntroductionStepProps {
  onComplete: () => void;
}

export default function IntroductionStep({ onComplete }: IntroductionStepProps) {
  const introduction = useProfileSetupStore((s) => s.data.introduction ?? "");
  const updateIntroduction = useProfileSetupStore((s) => s.updateIntroduction);
  const data = useProfileSetupStore((s) => s.data);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setStep } = useProfileFunnel();
  const handleChange = (value: string) => {
    updateIntroduction(value.slice(0, MAX_LENGTH));
  };

  const { mutateAsync: submitProfile, isPending } = useSubmitProfile();

  const handleSubmit = async () => {
    const validation = profileSubmitSchema.safeParse(data);

    if (!validation.success) {
      const message = validation.error.errors[0].message;
      Toast.show({ type: "error", message });
      logger.error(message);
      if (!data.newUsername) setStep("nickname");
      else if (!data.gender) setStep("gender");
      else if (!data.preferredStyles?.length) setStep("shooting-style");
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
      hideDefaultFooter={true}
    >
      <div className="flex flex-col gap-2 grow">
        <h1 className="text-body-1 font-semibold text-gray-900">
          {"한 줄 자기소개"}
        </h1>
        <TextArea
          value={introduction}
          onChange={handleChange}
          placeholder="자기소개를 입력해주세요"
          autoFocus
          rows={3}
          maxLength={MAX_LENGTH}
          caption={`${introduction.length}/${MAX_LENGTH}`}
        />
      </div>
      <div className="sticky bottom-0 flex flex-col gap-3 pt-5 pb-[calc(20px+env(safe-area-inset-bottom))] bg-white [&_button]:h-[52px]">
        <Button.Primary fullWidth size="large" onClick={handleSubmit} disabled={isSubmitting || isPending}>
          {isSubmitting || isPending ? "프로필 저장 중..." : "프로필 완성"}
        </Button.Primary>
      </div>
    </ProfileStepLayout>
  );
}
