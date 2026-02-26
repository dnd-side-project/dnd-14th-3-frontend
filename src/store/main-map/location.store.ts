import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";

export type LocationSource = "manual" | "shared";

export interface StoredLocation {
  lat: number;
  lng: number;
}

type LocationState = {
  selectedLocation: StoredLocation | null;
  source: LocationSource | null;
  updatedAt: number | null;
  hasHydrated: boolean;
  setSelectedLocation: (location: StoredLocation, source: LocationSource) => void;
  clearSelectedLocation: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useMainMapLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selectedLocation: null,
      source: null,
      updatedAt: null,
      hasHydrated: false,
      setSelectedLocation: (location, source) =>
        set({
          selectedLocation: location,
          source,
          updatedAt: Date.now(),
        }),
      clearSelectedLocation: () =>
        set({
          selectedLocation: null,
          source: null,
          updatedAt: null,
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "main-map-location",
      storage: createJSONStorage(() => localStorage),
      partialize: (state: LocationState) => ({
        selectedLocation: state.selectedLocation,
        source: state.source,
        updatedAt: state.updatedAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
