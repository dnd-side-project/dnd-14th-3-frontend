import { createStore } from "zustand";

import type { FilterValues } from "@/types/companion-reservation";

export interface FilterState {
  values: FilterValues;
  setValues: (values: FilterValues) => void;
  resetValues: () => void;
}

const getInitialValues = (): FilterValues => ({
  dateRange: { start: null, end: null },
  ageGroups: [],
  gender: null,
  regions: [],
  keyword: "",
});

export const createFilterStore = () => {
  return createStore<FilterState>((set) => ({
    values: getInitialValues(),
    setValues: (values) => set({ values }),
    resetValues: () => set({ values: getInitialValues() }),
  }));
};

export type FilterStoreApi = ReturnType<typeof createFilterStore>;
