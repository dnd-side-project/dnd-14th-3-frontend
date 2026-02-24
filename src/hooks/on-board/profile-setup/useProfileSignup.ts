import { useNavigate } from "react-router-dom";

import { useFormContext } from "react-hook-form";

import type { ProfileSetupFormValues } from "@/types/on-board";
import { profileSetupDataSchema } from "@/types/on-board";

import { mapSignUpRequestDto } from "@/lib/auth/mapSignUpRequestDto";
import { logger } from "@/lib/shared/logger";

import { FIELD_TO_STEP } from "@/constants/on-board";

import {
  getRegisterToken,
  getSignupErrorMessage,
  isSignupInvalidParameterError,
  isSignupTokenError,
} from "@/services/auth";

import { Toast } from "@/store/shared/toast/toast.store";

import { useRequestSignup } from "@/queries/user/useRequestSignup";

import { useProfileFunnel } from "./useProfileFunnel";

export function useProfileSignup(onComplete: () => void) {
  const navigate = useNavigate();
  const { getValues } = useFormContext<ProfileSetupFormValues>();
  const { setStep } = useProfileFunnel();
  const { mutateAsync: requestSignup, isPending } = useRequestSignup();

  const submit = async () => {
    const data = getValues();
    const validation = profileSetupDataSchema.safeParse(data);

    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      const message = firstIssue?.message ?? "유효성 검증 실패";
      Toast.show({ type: "error", message });
      logger.error(message);

      const firstField = firstIssue?.path[0];
      if (typeof firstField === "string" && firstField in FIELD_TO_STEP) {
        setStep(FIELD_TO_STEP[firstField as keyof ProfileSetupFormValues]);
      }
      return;
    }

    const token = getRegisterToken();
    if (!token) {
      navigate("/login", { replace: true });
      Toast.show({ type: "error", message: "회원가입 토큰이 없습니다.\n다시 시도해주세요." });
      return;
    }

    try {
      await requestSignup({ token, data: mapSignUpRequestDto(validation.data) });
      Toast.show({
        type: "success",
        message: "프로필이 정상적으로 완성되었어요!",
        offsetY: 65,
      });
      onComplete();
    } catch (error) {
      if (isSignupTokenError(error)) {
        navigate("/login", { replace: true });
        Toast.show({
          type: "error",
          message: "인증이 만료되었습니다.\n다시 로그인해주세요.",
          offsetY: 65,
        });
        return;
      }

      if (isSignupInvalidParameterError(error)) {
        setStep("nickname");
        Toast.show({
          type: "error",
          message: getSignupErrorMessage(error) ?? "이미 존재하는 닉네임입니다.",
        });
        return;
      }

      Toast.show({
        type: "error",
        message: "프로필 저장에 실패했습니다.\n다시 시도해주세요.",
        offsetY: 65,
      });
    }
  };

  return { submit, isPending };
}
