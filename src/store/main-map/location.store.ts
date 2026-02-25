import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";

type LocationSource = "manual" | "shared";

export interface StoredLocation {
  lat: number;
  lng: number;
}

type LocationState = {
  selectedLocation: StoredLocation | null;
  source: LocationSource | null;
  updatedAt: number | null;
  setSelectedLocation: (location: StoredLocation, source: LocationSource) => void;
  clearSelectedLocation: () => void;
};

export const useMainMapLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selectedLocation: null,
      source: null,
      updatedAt: null,
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
    }),
    {
      name: "main-map-location",
      storage: createJSONStorage(() => localStorage),
      partialize: (state: LocationState) => ({
        selectedLocation: state.selectedLocation,
        source: state.source,
        updatedAt: state.updatedAt,
      }),
    }
  )
);
