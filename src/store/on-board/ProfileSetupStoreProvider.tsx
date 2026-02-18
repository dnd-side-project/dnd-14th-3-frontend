import { useState } from "react";

import type { ReactNode } from "react";

import { ProfileSetupStoreContext } from "./profile-setup.context";
import { createProfileSetupStore } from "./profile-setup.store";

export interface ProfileSetupStoreProviderProps {
  children: ReactNode;
}

export function ProfileSetupStoreProvider({
  children,
}: ProfileSetupStoreProviderProps) {
  const [store] = useState(() => createProfileSetupStore());
  return (
    <ProfileSetupStoreContext.Provider value={store}>
      {children}
    </ProfileSetupStoreContext.Provider>
  );
}
