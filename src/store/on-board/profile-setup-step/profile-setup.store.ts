import { createStore } from "zustand";

import type { ProfileSetupStep } from "@/types/on-board";

export interface ProfileSetupState {
  currentStep: ProfileSetupStep;

  setStep: (step: ProfileSetupStep) => void;
}

const getInitialState = (): Pick<ProfileSetupState, "currentStep"> => ({
  currentStep: "nickname",
});

export const createProfileSetupStore = () => {
  return createStore<Pick<ProfileSetupState, "currentStep" | "setStep">>((set) => ({
    ...getInitialState(),
    setStep: (step) => set({ currentStep: step }),
  }));
};

export type ProfileSetupStoreApi = ReturnType<typeof createProfileSetupStore>;
