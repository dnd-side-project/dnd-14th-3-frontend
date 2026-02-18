import { createStore } from "zustand";

import type {
  AgeRange,
  Gender,
  ProfileSetupData,
  ProfileSetupStep,
  ShootingStyleId,
} from "@/types/on-board";

export interface ProfileSetupState {
  data: Partial<ProfileSetupData>;
  currentStep: ProfileSetupStep;

  updateNickname: (nickname: string) => void;
  updateIntroduction: (introduction: string) => void;
  updateGender: (gender: Gender) => void;
  toggleShootingStyle: (styleId: ShootingStyleId) => void;
  updateAgeRange: (ageRange: AgeRange) => void;
  setStep: (step: ProfileSetupStep) => void;
}

const getInitialState = (): Pick<
  ProfileSetupState,
  "data" | "currentStep"
> => ({
  data: {
    newUsername: "",
    introduction: "",
    gender: undefined,
    preferredStyles: [],
    ageRange: undefined,
  },
  currentStep: "nickname",
});

export const createProfileSetupStore = () => {
  return createStore<ProfileSetupState>((set) => ({
    ...getInitialState(),

    updateNickname: (nickname) =>
      set((state) => ({
        data: { ...state.data, newUsername: nickname },
      })),

    updateIntroduction: (introduction) =>
      set((state) => ({
        data: { ...state.data, introduction },
      })),

    updateGender: (gender) =>
      set((state) => ({
        data: { ...state.data, gender },
      })),

    toggleShootingStyle: (styleId) =>
      set((state) => {
        const styles = state.data.preferredStyles ?? [];
        const newStyles = styles.includes(styleId)
          ? styles.filter((id) => id !== styleId)
          : [...styles, styleId];
        return { data: { ...state.data, preferredStyles: newStyles } };
      }),

    updateAgeRange: (ageRange) =>
      set((state) => ({
        data: { ...state.data, ageRange },
      })),

    setStep: (step) => set({ currentStep: step }),
  }));
};

export type ProfileSetupStoreApi = ReturnType<typeof createProfileSetupStore>;
