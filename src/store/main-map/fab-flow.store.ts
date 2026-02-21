import { create } from "zustand";

interface MainMapFabFlowState {
  isFabExpanded: boolean;
  isLocationShareSetupModalOpen: boolean;
  isFindCompanionModalOpen: boolean;
  setFabExpanded: (isExpanded: boolean) => void;
  toggleFabExpanded: () => void;
  closeFab: () => void;
  openLocationShareSetupModal: () => void;
  openFindCompanionModal: () => void;
  closeLocationShareSetupModal: () => void;
  closeFindCompanionModal: () => void;
  closeAllModals: () => void;
}

export const useMainMapFabFlowStore = create<MainMapFabFlowState>((set) => ({
  isFabExpanded: false,
  isLocationShareSetupModalOpen: false,
  isFindCompanionModalOpen: false,
  setFabExpanded: (isExpanded) => set({ isFabExpanded: isExpanded }),
  toggleFabExpanded: () => set((state) => ({ isFabExpanded: !state.isFabExpanded })),
  closeFab: () => set({ isFabExpanded: false }),
  openLocationShareSetupModal: () => set({ isLocationShareSetupModalOpen: true }),
  openFindCompanionModal: () => set({ isFindCompanionModalOpen: true }),
  closeLocationShareSetupModal: () => set({ isLocationShareSetupModalOpen: false }),
  closeFindCompanionModal: () => set({ isFindCompanionModalOpen: false }),
  closeAllModals: () =>
    set({
      isLocationShareSetupModalOpen: false,
      isFindCompanionModalOpen: false,
    }),
}));
