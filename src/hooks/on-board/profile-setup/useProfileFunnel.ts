import { useCallback, useMemo } from "react";

import { z } from "zod";

import {
  nicknameSchema,
  profileSubmitSchema,
} from "@/types/on-board";

import { PROFILE_SETUP_STEPS } from "@/constants/on-board";

import { useProfileSetupStore } from "@/store/on-board/profile-setup.provider";

export function useProfileFunnel() {
  const { currentStep, setStep, data } = useProfileSetupStore();

  const currentIndex = useMemo(() => PROFILE_SETUP_STEPS.indexOf(currentStep), [currentStep]);
  const totalSteps = useMemo(() => PROFILE_SETUP_STEPS.length, []);
  const progress = useMemo(() => ((currentIndex + 1) / totalSteps) * 100, [currentIndex, totalSteps]);

  const canGoNext = (): boolean => {
    switch (currentStep) {
      case "nickname": {
        const result = nicknameSchema.safeParse(data.newUsername);
        return result.success;
      }
      case "introduction":
        return (data.introduction?.length ?? 0) > 0;
      case "gender":
        return data.gender !== undefined;
      case "shooting-style":
        return (data.preferredStyles?.length ?? 0) > 0;
      case "age-range":
        return data.ageRange !== undefined;
      default:
        return false;
    }
  };

  const validateAll = (): { isValid: true } | { isValid: false; errors: string[] } => {
    try {
      profileSubmitSchema.parse({
        newUsername: data.newUsername,
        gender: data.gender,
        preferredStyles: data.preferredStyles,
      });
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
    canGoNext: canGoNext(),
    goNext,
    goBack,
    isFirstStep,
    isLastStep,
    steps: PROFILE_SETUP_STEPS,
    setStep,
    validateAll,
  };
}
