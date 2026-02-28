import { createContext, useContext } from "react";

import { useStore } from "zustand";

import type {
  ReservationCreateStepState,
  ReservationCreateStepStoreApi,
} from "./reservation-create-step.store";

export const ReservationCreateStepStoreContext = createContext<
  ReservationCreateStepStoreApi | undefined
>(undefined);

const identitySelector = (s: ReservationCreateStepState) => s;

export function useReservationCreateStepStore(): ReservationCreateStepState;
export function useReservationCreateStepStore<T>(
  selector: (state: ReservationCreateStepState) => T
): T;
export function useReservationCreateStepStore<T>(
  selector?: (state: ReservationCreateStepState) => T
): T | ReservationCreateStepState {
  const store = useContext(ReservationCreateStepStoreContext);

  if (!store) {
    throw new Error(
      "useReservationCreateStepStore must be used within ReservationCreateStepStoreProvider"
    );
  }

  return useStore(
    store,
    selector ?? (identitySelector as (state: ReservationCreateStepState) => T)
  );
}
