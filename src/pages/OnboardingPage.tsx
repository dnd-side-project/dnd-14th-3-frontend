import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import type { OnboardingStep } from "@/types/on-board";

import { getOnboardingStep } from "@/lib/on-board/getOnboardingStep";

import { IntroStepWidget, ProfileSetupWidget } from "@/components/on-board";
import NotificationPermissionWidget from "@/components/on-board/notification-permission/NotificationPermissionWidget";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const stepParam = searchParams.get("step");
  const step = getOnboardingStep(stepParam);

  const handleChangeStep = useCallback((nextStep: OnboardingStep) => {
    setSearchParams({ step: nextStep });
  }, [setSearchParams]);

  const handleOnboardingComplete = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleStepComplete = useMemo(() => ({
    intro: () => handleChangeStep("profile"),
    profile: () => handleChangeStep("notification"),
    notification: () => handleOnboardingComplete(),
  }), [handleChangeStep, handleOnboardingComplete]);

  const renderOnboardingStep = () => {
    switch (step) {
      case "intro":
      default:
        return <IntroStepWidget onComplete={handleStepComplete.intro} />;
      case "profile":
        return <ProfileSetupWidget onComplete={handleStepComplete.profile} />;
      case "notification":
        return <NotificationPermissionWidget onComplete={handleStepComplete.notification} />
    }
  };

  return renderOnboardingStep();
}
