import { ProfileSetupStoreProvider } from "@/store/on-board/profile-setup.provider";

import ProfileSetupFunnel from "./ProfileSetupFunnel";

interface ProfileSetupWidgetProps {
  onComplete: () => void;
}

export default function ProfileSetupWidget({ onComplete }: ProfileSetupWidgetProps) {
  return (
    <ProfileSetupStoreProvider>
      <section className="flex min-h-dvh w-full flex-col">
        <ProfileSetupFunnel onComplete={onComplete} />
      </section>
    </ProfileSetupStoreProvider>
  );
}
