import type { OnboardingStep } from "@/types/on-board";

import { ONBOARDING_STEPS } from "@/constants/on-board/onboarding-steps";

export function getOnboardingStep(stepParam: string | null): OnboardingStep {
  return ONBOARDING_STEPS.includes(stepParam as OnboardingStep)
    ? (stepParam as OnboardingStep)
    : "intro";
}
