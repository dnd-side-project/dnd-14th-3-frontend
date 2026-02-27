import { Controller, useFormContext } from "react-hook-form";

import type { AgeRange, ProfileSetupFormValues } from "@/types/profile";

import { useProfileFunnel } from "@/hooks/on-board";

import { ChipButton } from "@/components/shared/chip-button";

import ProfileStepLayout from "../ProfileStepLayout";

const AGE_RANGE_OPTIONS: { value: AgeRange; label: string }[] = [
  { value: "TEENS", label: "10대" },
  { value: "TWENTIES", label: "20대" },
  { value: "THIRTIES", label: "30대" },
  { value: "FORTIES", label: "40대" },
  { value: "FIFTIES_AND_ABOVE", label: "50대 이상" },
];

export default function AgeRangeStep() {
  const { control } = useFormContext<ProfileSetupFormValues>();
  const { canGoNext, goNext, goBack, isFirstStep, isLastStep } = useProfileFunnel();

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
      <Controller
        control={control}
        name="ageRange"
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            {AGE_RANGE_OPTIONS.map(({ value, label }) => {
              const isSelected = field.value === value;
              return (
                <ChipButton
                  key={value}
                  type="button"
                  size="medium"
                  selected={isSelected}
                  onClick={() => field.onChange(value)}
                  className={`flex-1 rounded-lg py-2 w-full text-body-1 font-bold transition-colors`}
                >
                  {label}
                </ChipButton>
              );
            })}
          </div>
        )}
      />
    </ProfileStepLayout>
  );
}
