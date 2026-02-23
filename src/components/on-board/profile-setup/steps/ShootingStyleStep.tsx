import { useCallback, useMemo } from "react";

import { Controller, useFormContext } from "react-hook-form";

import { ProfileSetupFormValues } from "@/types/on-board";

import { FALLBACK_SHOOTING_STYLES } from "@/constants/on-board";

import { useProfileFunnel } from "@/hooks/on-board";

import { useShootingStyles } from "@/queries/user";

import { ChipButton } from "@/components/shared/chip-button";

import ProfileStepLayout from "../ProfileStepLayout";

export default function ShootingStyleStep() {
  const { control } = useFormContext<ProfileSetupFormValues>();
  const { canGoNext, goNext, goBack, isFirstStep, isLastStep } = useProfileFunnel();
  const { data: apiStyles, isLoading, isError, refetch } = useShootingStyles();

  const styles = useMemo(
    () => (isError ? FALLBACK_SHOOTING_STYLES : (apiStyles ?? [])),
    [isError, apiStyles]
  );
  const styleLength = useMemo(() => styles.length, [styles]);

  const toggleStyleTag = useCallback((styleId: string, currentValue: string[]) => {
    if (currentValue.includes(styleId)) {
      return currentValue.filter((id) => id !== styleId);
    }
    return [...currentValue, styleId];
  }, []);

  return (
    <ProfileStepLayout
      title={"선호하는 촬영 스타일을\n모두 선택해주세요."}
      description={"매칭 상대에게 미리 선호하는 스타일을 알려주세요."}
      canGoNext={canGoNext}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      onNext={goNext}
      onBack={goBack}
    >
      <Controller
        control={control}
        name="preferredStyles"
        render={({ field }) => (
          <>
            {isLoading && (
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: styleLength }).map((_, i) => (
                  <div key={i} className="h-12 w-24 animate-pulse rounded-md bg-gray-200" />
                ))}
              </div>
            )}
            {!isLoading && styles.length > 0 && (
              <div className="flex flex-col gap-3">
                {isError && (
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-label-1 text-warning-500">
                      촬영 스타일 목록을 불러오지 못해 기본 목록을 표시합니다.
                    </p>
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="rounded-md px-3 py-1.5 text-label-1 font-medium text-mint-600"
                    >
                      다시 시도
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  {styles.map((style) => {
                    const isSelected = field.value.includes(style.id);
                    return (
                      <ChipButton
                        key={style.id}
                        selected={isSelected}
                        onClick={() => field.onChange(toggleStyleTag(style.id, field.value))}
                      >
                        {style.label}
                      </ChipButton>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      />
    </ProfileStepLayout>
  );
}
