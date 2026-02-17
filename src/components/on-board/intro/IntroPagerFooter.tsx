import { AnimatePresence, motion } from "framer-motion";

import type { ReactNode } from "react";

import { Button } from "@/components/shared/button";

interface IntroPagerFooterProps {
  isLastStep: boolean;
  ctaLabel: string;
  onComplete: () => void;
  dots: ReactNode;
}

export default function IntroPagerFooter({
  isLastStep,
  ctaLabel,
  onComplete,
  dots,
}: IntroPagerFooterProps) {
  return (
    <div className="relative flex h-[84px] items-end justify-center">
      <AnimatePresence initial={false}>
        {isLastStep ? (
          <motion.div
            key="cta"
            className="absolute inset-0 z-10 flex items-end justify-center"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <Button.Primary fullWidth className="text-body-1" onClick={onComplete}>
              {ctaLabel}
            </Button.Primary>
          </motion.div>
        ) : (
          <motion.div
            key="dots"
            className="absolute inset-0 flex items-end justify-center py-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          >
            {dots}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
