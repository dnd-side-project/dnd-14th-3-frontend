import { useState } from "react";

import type { ReactNode } from "react";

import { FilterStoreContext } from "./filter.context";
import { createFilterStore } from "./filter.store";

interface FilterStoreProviderProps {
  children: ReactNode;
}

export function FilterStoreProvider({ children }: FilterStoreProviderProps) {
  const [store] = useState(() => createFilterStore());
  return (
    <FilterStoreContext.Provider value={store}>
      {children}
    </FilterStoreContext.Provider>
  );
}
