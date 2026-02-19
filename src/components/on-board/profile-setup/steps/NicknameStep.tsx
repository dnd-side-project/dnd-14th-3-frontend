import { AnimatePresence, motion } from "framer-motion";

import { useProfileSetupStore } from "@/store/on-board/profile-setup.provider";

import { useNicknameValidation, useProfileFunnel } from "@/hooks/on-board";

import { WarnCircleIcon } from "@/components/shared/icons";

import ProfileStepLayout from "../ProfileStepLayout";

export default function NicknameStep() {
  const storeNickname = useProfileSetupStore((s) => s.data.newUsername ?? "");
  const updateNickname = useProfileSetupStore((s) => s.updateNickname);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    validation,
    isValidating,
    maxLength,
  } = useNicknameValidation(storeNickname, updateNickname);

  const nickname = watch("nickname");
  const {
    canGoNext,
    goNext,
    goBack,
    isFirstStep,
    isLastStep,
  } = useProfileFunnel();

  const errorMessage = errors.nickname?.message;
  const borderClass = !isValidating && errorMessage
    ? "border-b border-warning-500"
    : "border-b border-gray-300 focus-within:border-mint-500" + ((nickname ?? "").length > 0 ? " border-mint-500" : "");

  return (
    <ProfileStepLayout
      title="닉네임을 입력해주세요."
      description="찍어줄게에서 활동할 닉네임을 정해주세요."
      canGoNext={canGoNext && validation.isValid && !isValidating}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      onNext={goNext}
      onBack={goBack}
    >
      <div className="flex flex-col gap-1">
        <div
          className={`flex items-center gap-2 ${borderClass} pb-2 px-2 transition-colors`}
        >
          <input
            {...register("nickname", {
              maxLength,
              onBlur(e) {
                const trimmed = e.target.value.trim();
                if (trimmed !== e.target.value) setValue("nickname", trimmed);
              },
            })}
            type="text"
            placeholder="닉네임을 입력해주세요"
            autoFocus
            className="flex-1 bg-transparent text-title-2 font-medium text-gray-900 outline-none placeholder:text-gray-500"
            maxLength={maxLength}
            aria-invalid={!!errorMessage}
            aria-describedby={errorMessage ? "nickname-error" : undefined}
          />
          {isValidating && (
            <span
              className="size-5 animate-spin rounded-full border-2 border-mint-500 border-t-transparent"
              aria-hidden
            />
          )}
          {validation.isValid && !isValidating && !!nickname.trim() && (
            <span className="text-mint-500" aria-hidden>
              ✓
            </span>
          )}
          <span className="text-label-1 text-gray-500 tabular-nums">
            {(nickname ?? "").length}/{maxLength}
          </span>
        </div>
        <AnimatePresence>
          {!isValidating && errorMessage && (
            <motion.p
              id="nickname-error"
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-label-1 text-warning-500 px-0.5 flex items-center gap-1"
            >
              <WarnCircleIcon className="size-5" />
              {errorMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </ProfileStepLayout>
  );
}
