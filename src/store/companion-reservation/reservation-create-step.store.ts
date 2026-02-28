import { createStore } from "zustand";

export const CREATE_STEPS = [
  "location-search", // 1. 위치 검색
  "location-adjust", // 2. 위치 조정
  "specific-place", // 3. 상세 위치 기입
  "date", // 4. 날짜 결정
  "time", // 5. 시간 결정
  "details", // 6. 촬영소요/제목/요청메시지
] as const;

export type CreateStep = (typeof CREATE_STEPS)[number];

export const CREATE_STEP_INDEX: Record<CreateStep, number> = {
  "location-search": 0,
  "location-adjust": 1,
  "specific-place": 2,
  date: 3,
  time: 4,
  details: 5,
};

export interface ReservationCreateStepState {
  currentStep: CreateStep;
  stepIndex: number;
  goNext: () => void;
  goPrev: () => void;
  goToStep: (step: CreateStep) => void;
  reset: () => void;
}

const INITIAL_STEP: CreateStep = "location-search";

export const createReservationCreateStepStore = () => {
  return createStore<ReservationCreateStepState>((set) => ({
    currentStep: INITIAL_STEP,
    stepIndex: 0,

    goNext: () =>
      set((state) => {
        const nextIndex = Math.min(state.stepIndex + 1, CREATE_STEPS.length - 1);
        return {
          stepIndex: nextIndex,
          currentStep: CREATE_STEPS[nextIndex],
        };
      }),

    goPrev: () =>
      set((state) => {
        const prevIndex = Math.max(state.stepIndex - 1, 0);
        return {
          stepIndex: prevIndex,
          currentStep: CREATE_STEPS[prevIndex],
        };
      }),

    goToStep: (step) =>
      set(() => {
        const index = CREATE_STEP_INDEX[step];
        return { currentStep: step, stepIndex: index };
      }),

    reset: () => set({ currentStep: INITIAL_STEP, stepIndex: 0 }),
  }));
};

export type ReservationCreateStepStoreApi = ReturnType<typeof createReservationCreateStepStore>;
