import { Controller, useFormContext } from "react-hook-form";

import type { Gender, ProfileSetupFormValues } from "@/types/on-board";

import { useProfileFunnel } from "@/hooks/on-board";

import { ChipButton } from "@/components/shared/chip-button";

import ProfileStepLayout from "../ProfileStepLayout";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "남성" },
  { value: "FEMALE", label: "여성" },
];

export default function GenderStep() {
  const { control } = useFormContext<ProfileSetupFormValues>();
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
      <Controller
        control={control}
        name="gender"
        render={({ field }) => (
          <div className="flex gap-3">
            {GENDER_OPTIONS.map(({ value, label }) => {
              const isSelected = field.value === value;
              return (
                <ChipButton
                  key={value}
                  type="button"
                  size="medium"
                  selected={isSelected}
                  onClick={() => field.onChange(value)}
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
        )}
      />
    </ProfileStepLayout>
  );
}
