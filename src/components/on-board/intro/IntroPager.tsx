import { AnimatePresence, useMotionValue } from "framer-motion";

import type { IntroStepContent } from "@/types/on-board";

import {
  usePagerDrag,
  usePagerKeyboard,
  usePagerSpring,
  usePagerState,
  useSlideViewport,
} from "@/hooks/on-board";

import IntroPagerFooter from "./IntroPagerFooter";
import IntroSlideContent from "./IntroSlideContent";
import PagerDots from "./PagerDots";
import PagerTrack from "./PagerTrack";

interface IntroPagerProps {
  steps: IntroStepContent[];
  onComplete: () => void;
}

export default function IntroPager({ steps, onComplete }: IntroPagerProps) {
  const totalSlides = steps.length;
  const { index, setIndex, goTo, isLast } = usePagerState(totalSlides);
  const { viewportRef, slideWidth } = useSlideViewport();
  const x = useMotionValue(0);

  usePagerSpring(x, index, slideWidth);
  const handleDragEnd = usePagerDrag(x, index, slideWidth, totalSlides, setIndex);

  usePagerKeyboard(goTo, index, totalSlides);

  const currentStep = steps[index] ?? null;
  const defaultCtaLabel = "시작하기";

  if (totalSlides === 0) {
    return <div className="flex min-h-dvh items-center justify-center text-warning-500 text-body-1 font-bold">삽입된 스텝이 없습니다.</div>;
  }

  return (
    <section className="flex min-h-dvh w-full flex-col px-5 pt-[76px] pb-[calc(20px+env(safe-area-inset-bottom))]">
      <AnimatePresence mode="sync">
        <div className="flex flex-1 items-center justify-center">
          <div ref={viewportRef} className="w-full overflow-hidden">
            <PagerTrack
              x={x}
              slideWidth={slideWidth}
              totalSlides={totalSlides}
              onDragEnd={handleDragEnd}
            >
              {steps.map((step, stepIndex) => (
                <IntroSlideContent
                  key={step.id}
                  step={step}
                  imageLoading={
                    stepIndex >= index - 1 && stepIndex <= index + 1 ? "eager" : "lazy"
                  }
                  imagePriority={stepIndex === index ? "high" : undefined}
                />
              ))}
            </PagerTrack>
          </div>
        </div>

        <IntroPagerFooter
          isLastStep={isLast}
          ctaLabel={currentStep?.ctaLabel ?? defaultCtaLabel}
          onComplete={onComplete}
          dots={
            <PagerDots
              count={totalSlides}
              currentIndex={index}
              onSelect={setIndex}
            />
          }
        />
      </AnimatePresence>
    </section>
  );
}
