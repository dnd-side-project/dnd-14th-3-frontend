import type { AgeRange } from "@/types/on-board";

import { useProfileSetupStore } from "@/store/on-board/profile-setup.provider";

import { useProfileFunnel } from "@/hooks/on-board";

import { ChipButton } from "@/components/shared/chip-button";

import ProfileStepLayout from "../ProfileStepLayout";

const AGE_RANGE_OPTIONS: { value: AgeRange; label: string }[] = [
  { value: "10s", label: "10대" },
  { value: "20s", label: "20대" },
  { value: "30s", label: "30대" },
  { value: "40s", label: "40대" },
  { value: "50s", label: "50대" },
  { value: "60s", label: "60대" },
  { value: "over-70s", label: "70대 이상" },
];

export default function AgeRangeStep() {
  const ageRange = useProfileSetupStore((s) => s.data.ageRange);
  const updateAgeRange = useProfileSetupStore((s) => s.updateAgeRange);
  const {
    canGoNext,
    goNext,
    goBack,
    isFirstStep,
    isLastStep,
  } = useProfileFunnel();

  return (
    <ProfileStepLayout
      title="나이대를 선택해주세요."
      description={"매칭 시 나이대가 공개되며,\n수집된 정보는 외부에 공개되지 않아요."}
      canGoNext={canGoNext}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      onNext={goNext}
      onBack={goBack}
    >
      <div className="flex flex-col gap-2">
        {AGE_RANGE_OPTIONS.map(({ value, label }) => {
          const isSelected = ageRange === value;
          return (
            <ChipButton
              key={value}
              type="button"
              size="medium"
              selected={isSelected}
              onClick={() => updateAgeRange(value)}
              className={`flex-1 rounded-lg py-2 w-full text-body-1 font-bold transition-colors`}
            >
              {label}
            </ChipButton>
          );
        })}
      </div>
    </ProfileStepLayout>
  );
}
