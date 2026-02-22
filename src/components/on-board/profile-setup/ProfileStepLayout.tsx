import type { ReactNode } from "react";

import Button from "@/components/shared/button/Button";

interface ProfileStepLayoutBaseProps {
  title: string;
  description?: string;
  children: ReactNode;
}

interface ProfileStepLayoutWithFooterProps extends ProfileStepLayoutBaseProps {
  hideDefaultFooter?: false;
  canGoNext: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onBack: () => void;
  skipEnabled?: boolean;
  onSkip?: () => void;
  nextLabel?: string;
}

interface ProfileStepLayoutWithoutFooterProps extends ProfileStepLayoutBaseProps {
  /** When true, hide the default next/back footer (e.g. PhotoUploadStep has its own buttons) */
  hideDefaultFooter: true;
  canGoNext?: never;
  isFirstStep?: never;
  isLastStep?: never;
  onNext?: never;
  onBack?: never;
  skipEnabled?: never;
  onSkip?: never;
  nextLabel?: never;
}

type ProfileStepLayoutProps =
  | ProfileStepLayoutWithFooterProps
  | ProfileStepLayoutWithoutFooterProps;

export default function ProfileStepLayout(props: ProfileStepLayoutProps) {
  const { title, description, children } = props;
  const hideDefaultFooter = props.hideDefaultFooter === true;
  const footerProps = hideDefaultFooter ? null : props;
  const label = footerProps
    ? footerProps.nextLabel ?? (footerProps.isLastStep ? "프로필 완성" : "다음")
    : "";

  return (
    <div className="flex grow w-full flex-col gap-10 px-5">
      <div className="flex flex-col gap-4">
        <h2 className="text-title-3 font-bold text-gray-900 whitespace-pre-line">{title}</h2>
        {description && (
          <p className="mt-1 text-body-1 text-gray-500 whitespace-pre-line">
            {description}
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-10">{children}</div>

      {!hideDefaultFooter && (
        <div className="sticky bottom-0 mt-auto flex flex-col gap-3 pt-5 pb-[calc(20px+env(safe-area-inset-bottom))] bg-white [&_button]:h-[52px]">
          {footerProps?.skipEnabled && footerProps.onSkip && (
            <Button.Secondary fullWidth size="large" onClick={footerProps.onSkip}>
              건너뛰기
            </Button.Secondary>
          )}
          <div className="flex gap-3">
            {!footerProps?.isFirstStep && (
              <Button.Secondary
                size="large"
                onClick={footerProps?.onBack}
                className="shrink-0 flex-1"
              >
                뒤로
              </Button.Secondary>
            )}
            <Button.Primary
              fullWidth
              size="large"
              className="flex-1"
              disabled={!footerProps?.canGoNext}
              onClick={footerProps?.onNext}
            >
              {label}
            </Button.Primary>
          </div>
        </div>
      )}
    </div>
  );
}
