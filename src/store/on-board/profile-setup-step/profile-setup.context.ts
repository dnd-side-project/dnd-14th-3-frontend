import { createContext, useContext } from "react";

import { useStore } from "zustand";

import type { ProfileSetupState, ProfileSetupStoreApi } from "./profile-setup.store";

export const ProfileSetupStoreContext =
  createContext<ProfileSetupStoreApi | undefined>(undefined);

const identitySelector = (s: ProfileSetupState) => s;

export function useProfileSetupStore(): ProfileSetupState;
export function useProfileSetupStore<T>(
  selector: (state: ProfileSetupState) => T
): T;
export function useProfileSetupStore<T>(
  selector?: (state: ProfileSetupState) => T
): T | ProfileSetupState {
  const store = useContext(ProfileSetupStoreContext);

  if (!store) {
    throw new Error(
      "useProfileSetupStore must be used within ProfileSetupStoreProvider"
    );
  }

  return useStore(store, selector ?? (identitySelector as (state: ProfileSetupState) => T));
}

/** store 인스턴스가 필요할 때 (예: setState 직접 호출) */
export function useProfileSetupStoreApi(): ProfileSetupStoreApi {
  const store = useContext(ProfileSetupStoreContext);
  if (store === undefined) {
    throw new Error(
      "useProfileSetupStoreApi must be used within ProfileSetupStoreProvider"
    );
  }
  return store;
}
