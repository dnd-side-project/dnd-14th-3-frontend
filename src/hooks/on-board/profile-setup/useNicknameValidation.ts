import { useEffect, useState } from "react";

import { RegisterOptions, useForm, useWatch } from "react-hook-form";

import type { NicknameValidation } from "@/types/on-board";
import { nicknameSchema } from "@/types/on-board";

import { useDebounce } from "@/hooks/shared/useDebounce";

import { useValidateNickname } from "@/queries/user";

const MAX_LENGTH = 15;

export type NicknameField = { nickname: string };

export function useNicknameValidation(
  initialNickname: string,
  syncToStore: (nickname: string) => void
) {
  const { register, watch, setValue, setError, clearErrors, formState, control } =
    useForm<NicknameField>({
      defaultValues: { nickname: initialNickname },
    });

  const nickname = useWatch({ control, name: "nickname" });
  const debouncedNickname = useDebounce(nickname ?? "", 300);

  const [hasEverHadValue, setHasEverHadValue] = useState(false);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 값이 입력되는 순간 딱 한 번만 true로 변경
    if (!hasEverHadValue && value.trim().length > 0) {
      setHasEverHadValue(true);
    }
  };

  const formatValidation = nicknameSchema.safeParse(debouncedNickname);
  const isFormatInvalid = debouncedNickname && !formatValidation.success;

  const { mutate, data: apiValidation, isPending } = useValidateNickname();

  useEffect(() => {
    if (debouncedNickname && !isFormatInvalid) {
      mutate({ nickname: debouncedNickname });
    }
  }, [debouncedNickname, isFormatInvalid, mutate]);

  const isTyping = nickname !== debouncedNickname;
  const isValidating = isPending || formState.isValidating || isTyping;

  const validation: NicknameValidation = (() => {
    if (!debouncedNickname.trim()) {
      // 작성했다가 지운 경우: isDirty는 값이 default와 같아지면 false가 되므로 state로 추적
      if (!hasEverHadValue) return { isValid: true };
      return { isValid: false, error: "닉네임을 입력해주세요", type: "format" };
    }
    if (isFormatInvalid)
      return {
        isValid: false,
        error: formatValidation.error.errors[0].message,
        type: "format",
      };

    return apiValidation ?? { isValid: false, error: "알 수 없는 오류가 발생했습니다." };
  })();

  useEffect(() => {
    if (isValidating) return;
    if (!validation.isValid && validation.error) {
      setError("nickname", { type: "validate", message: validation.error });
    } else {
      clearErrors("nickname");
    }
  }, [isValidating, validation.isValid, validation.error, setError, clearErrors]);

  // 검증 완료 후 isValid면 store에 적용
  useEffect(() => {
    if (!isValidating && validation.isValid && debouncedNickname) {
      syncToStore(debouncedNickname.trim());
    }
  }, [isValidating, validation.isValid, debouncedNickname, syncToStore]);

  return {
    register: (name: keyof NicknameField, options?:RegisterOptions<NicknameField, keyof NicknameField>) => ({
      ...register(name, options),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        register(name).onChange(e); // 기존 useForm의 onChange 실행
        handleNicknameChange(e); // 우리가 만든 상태 업데이트 실행
      },
    }),
    watch,
    setValue,
    formState,
    validation,
    isValidating,
    maxLength: MAX_LENGTH,
  };
}
