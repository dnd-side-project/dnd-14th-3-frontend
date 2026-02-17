import { INTRO_STEPS } from "@/constants/on-board";

import IntroPager from "@/components/on-board/intro/IntroPager";

interface IntroStepWidgetProps {
  onComplete: () => void;
}

export default function IntroStepWidget({ onComplete }: IntroStepWidgetProps) {
  return (
    <section className="flex h-full w-full flex-col">
      <IntroPager steps={INTRO_STEPS} onComplete={onComplete} />
    </section>
  );
}
