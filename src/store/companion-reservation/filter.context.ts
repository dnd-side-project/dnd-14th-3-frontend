import { createContext, useContext } from "react";

import { useStore } from "zustand";

import type { FilterState, FilterStoreApi } from "./filter.store";

export const FilterStoreContext = createContext<FilterStoreApi | undefined>(undefined);

const identitySelector = (s: FilterState) => s;

export function useFilterStore(): FilterState;
export function useFilterStore<T>(selector: (state: FilterState) => T): T;
export function useFilterStore<T>(selector?: (state: FilterState) => T): T | FilterState {
  const store = useContext(FilterStoreContext);

  if (!store) {
    throw new Error("useFilterStore must be used within FilterStoreProvider");
  }

  return useStore(store, selector ?? (identitySelector as (state: FilterState) => T));
}
