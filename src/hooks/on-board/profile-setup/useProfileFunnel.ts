import { useCallback, useMemo } from "react";

import { z } from "zod";

import { useFormContext, useWatch } from "react-hook-form";

import {
  nicknameSchema,
  profileSetupDataSchema,
  type ProfileSetupFormValues,
} from "@/types/profile";

import { PROFILE_SETUP_STEPS } from "@/constants/on-board";

import { useProfileSetupStore } from "@/store/on-board/profile-setup-step";

export function useProfileFunnel() {
  const currentStep = useProfileSetupStore((state) => state.currentStep);
  const setStep = useProfileSetupStore((state) => state.setStep);
  const { getValues } = useFormContext<ProfileSetupFormValues>();

  const currentData = useWatch<ProfileSetupFormValues>();
  const currentIndex = useMemo(() => PROFILE_SETUP_STEPS.indexOf(currentStep), [currentStep]);
  const totalSteps = useMemo(() => PROFILE_SETUP_STEPS.length, []);
  const progress = useMemo(
    () => ((currentIndex + 1) / totalSteps) * 100,
    [currentIndex, totalSteps]
  );

  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case "nickname": {
        const result = nicknameSchema.safeParse(currentData.newUsername);
        return result.success;
      }
      case "introduction":
        return true;
      case "gender":
        return currentData.gender !== undefined;
      case "shooting-style":
        return (currentData.preferredStyles?.length ?? 0) > 0;
      case "age-range":
        return currentData.ageRange !== undefined;
      default:
        return false;
    }
  }, [currentStep, currentData]);

  const validateAll = (): { isValid: true } | { isValid: false; errors: string[] } => {
    try {
      const data = getValues();
      profileSetupDataSchema.parse(data);

      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map((e) => e.message),
        };
      }
      return { isValid: false, errors: ["유효성 검증 실패"] };
    }
  };

  const goNext = useCallback(() => {
    if (currentIndex < totalSteps - 1) {
      setStep(PROFILE_SETUP_STEPS[currentIndex + 1]);
    }
  }, [currentIndex, totalSteps, setStep]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setStep(PROFILE_SETUP_STEPS[currentIndex - 1]);
    }
  }, [currentIndex, setStep]);

  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === totalSteps - 1;

  return {
    currentStep,
    progress,
    canGoNext,
    goNext,
    goBack,
    isFirstStep,
    isLastStep,
    steps: PROFILE_SETUP_STEPS,
    setStep,
    validateAll,
  };
}
