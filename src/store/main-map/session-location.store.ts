import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";

import type { StoredLocation } from "./location.store";

type SessionLocationState = {
  sessionId: number | null;
  destination: StoredLocation | null;
  partnerLocation: StoredLocation | null;
  setSessionId: (sessionId: number | null) => void;
  setDestination: (location: StoredLocation | null) => void;
  setPartnerLocation: (location: StoredLocation | null) => void;
  clear: () => void;
};

export const useMainMapSessionLocationStore = create<SessionLocationState>()(
  persist(
    (set) => ({
      sessionId: null,
      destination: null,
      partnerLocation: null,
      setSessionId: (sessionId) => set({ sessionId }),
      setDestination: (destination) => set({ destination }),
      setPartnerLocation: (partnerLocation) => set({ partnerLocation }),
      clear: () =>
        set({
          sessionId: null,
          destination: null,
          partnerLocation: null,
        }),
    }),
    {
      name: "main-map-session-location",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessionId: state.sessionId,
        destination: state.destination,
        partnerLocation: state.partnerLocation,
      }),
    }
  )
);
