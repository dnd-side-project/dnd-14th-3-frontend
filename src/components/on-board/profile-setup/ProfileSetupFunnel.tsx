import { useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { PROFILE_SETUP_STEPS } from "@/constants/on-board";

import { useProfileFunnel } from "@/hooks/on-board";

import AgeRangeStep from "./steps/AgeRangeStep";
import GenderStep from "./steps/GenderStep";
import IntroductionStep from "./steps/IntroductionStep";
import NicknameStep from "./steps/NicknameStep";
import ShootingStyleStep from "./steps/ShootingStyleStep";

interface ProfileSetupFunnelProps {
  onComplete: () => void;
}

export default function ProfileSetupFunnel({ onComplete }: ProfileSetupFunnelProps) {
  const { currentStep, progress } = useProfileFunnel();
  const [prevIndex, setPrevIndex] = useState(0);
  const currentIndex = useMemo(
    () => PROFILE_SETUP_STEPS.indexOf(currentStep),
    [currentStep]
  );

  // 방향 계산: 이전 인덱스보다 크면 forward, 작으면 backward (ref 대신 state 사용 - 렌더 중 접근 가능)
  const direction = currentIndex >= prevIndex ? "forward" : "backward";

  useEffect(() => {
    setPrevIndex(currentIndex);
  }, [currentIndex]);

  const renderStep = () => {
    switch (currentStep) {
      case "nickname":
        return <NicknameStep />;
      case "gender":
        return <GenderStep />;
      case "shooting-style":
        return <ShootingStyleStep />;
      case "age-range":
        return <AgeRangeStep />;
      case "introduction":
        return <IntroductionStep onComplete={onComplete} />;
      default:
        return null;
    }
  };

  // 방향에 따른 애니메이션 설정
  const variants = {
    enter: (direction: string) => ({
      x: direction === "forward" ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: string) => ({
      x: direction === "forward" ? -20 : 20,
      opacity: 0,
    }),
  };

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <div className="my-10 py-7 px-5">
        <div className="h-2 w-full overflow-hidden rounded-lg bg-mint-50">
          <div
            className="h-full rounded-lg bg-mint-500 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="flex grow"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
