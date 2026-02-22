import { create } from "zustand";

interface MainMapFabFlowState {
  isFabExpanded: boolean;
  isLocationShareSetupModalOpen: boolean;
  isFindCompanionModalOpen: boolean;
  locationShareModalType: "request" | "denied";
  setFabExpanded: (isExpanded: boolean) => void;
  toggleFabExpanded: () => void;
  closeFab: () => void;
  openLocationShareSetupModal: (type?: "request" | "denied") => void;
  openFindCompanionModal: () => void;
  closeLocationShareSetupModal: () => void;
  closeFindCompanionModal: () => void;
  closeAllModals: () => void;
}

export const useMainMapFabFlowStore = create<MainMapFabFlowState>((set) => ({
  isFabExpanded: false,
  isLocationShareSetupModalOpen: false,
  isFindCompanionModalOpen: false,
  locationShareModalType: "request",
  setFabExpanded: (isExpanded) => set({ isFabExpanded: isExpanded }),
  toggleFabExpanded: () => set((state) => ({ isFabExpanded: !state.isFabExpanded })),
  closeFab: () => set({ isFabExpanded: false }),
  openLocationShareSetupModal: (type = "request") =>
    set({ isLocationShareSetupModalOpen: true, locationShareModalType: type }),
  openFindCompanionModal: () => set({ isFindCompanionModalOpen: true }),
  closeLocationShareSetupModal: () =>
    set({ isLocationShareSetupModalOpen: false, locationShareModalType: "request" }),
  closeFindCompanionModal: () => set({ isFindCompanionModalOpen: false }),
  closeAllModals: () =>
    set({
      isLocationShareSetupModalOpen: false,
      isFindCompanionModalOpen: false,
      locationShareModalType: "request",
    }),
}));
