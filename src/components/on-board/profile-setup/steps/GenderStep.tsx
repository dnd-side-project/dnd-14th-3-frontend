import type { Gender } from "@/types/on-board";

import { useProfileSetupStore } from "@/store/on-board/profile-setup.provider";

import { useProfileFunnel } from "@/hooks/on-board";

import { ChipButton } from "@/components/shared/chip-button";

import ProfileStepLayout from "../ProfileStepLayout";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "남성" },
  { value: "FEMALE", label: "여성" },
];

export default function GenderStep() {
  const gender = useProfileSetupStore((s) => s.data.gender);
  const updateGender = useProfileSetupStore((s) => s.updateGender);
  const {
    canGoNext,
    goNext,
    goBack,
    isFirstStep,
    isLastStep,
  } = useProfileFunnel();

  return (
    <ProfileStepLayout
      title="성별을 선택해주세요."
      description={"매칭 시 성별이 공개되며,\n수집된 정보는 외부에 공개되지 않아요."}
      canGoNext={canGoNext}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      onNext={goNext}
      onBack={goBack}
    >
      <div className="flex gap-3">
        {GENDER_OPTIONS.map(({ value, label }) => {
          const isSelected = gender === value;
          return (
            <ChipButton
              key={value}
              type="button"
              size="medium"
              selected={isSelected}
              onClick={() => updateGender(value)}
              className={`flex-1 rounded-lg py-4 text-body-1 font-bold transition-colors ${isSelected
                  ? "bg-mint-500 text-gray-900"
                  : "bg-gray-50 text-gray-500"
                }`}
            >
              {label}
            </ChipButton>
          );
        })}
      </div>
    </ProfileStepLayout>
  );
}
