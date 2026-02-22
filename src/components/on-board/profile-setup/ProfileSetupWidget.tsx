import { ProfileSetupFormProvider,ProfileSetupStoreProvider  } from "@/store/on-board/profile-setup-step";

import ProfileSetupFunnel from "./ProfileSetupFunnel";

interface ProfileSetupWidgetProps {
  onComplete: () => void;
}

export default function ProfileSetupWidget({ onComplete }: ProfileSetupWidgetProps) {
  return (
    <ProfileSetupStoreProvider>
      <ProfileSetupFormProvider> 
      <section className="flex min-h-dvh w-full flex-col">
        <ProfileSetupFunnel onComplete={onComplete} />
      </section>
      </ProfileSetupFormProvider>
    </ProfileSetupStoreProvider>
  );
}
