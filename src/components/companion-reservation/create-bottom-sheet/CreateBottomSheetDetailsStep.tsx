import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import { Controller } from "react-hook-form";

import type { ShootingDuration } from "@/types/companion-reservation";

import { SHOOTING_DURATION_LABELS } from "@/constants/companion-reservation/shooting-duration";

import {
  useReservationCreateStepStore,
  useReservationFormContext,
} from "@/store/companion-reservation";
import { Toast } from "@/store/shared/toast/toast.store";

import { useCreateReservation } from "@/queries/companion-reservation";

import { Button } from "@/components/shared/button";
import { ChipButton } from "@/components/shared/chip-button";
import { TextArea } from "@/components/shared/textarea";

const TITLE_MAX = 50;
const REQUEST_MESSAGE_MAX = 200;

const SHOOTING_DURATION_OPTIONS = [
  "TEN_MINUTES",
  "TWENTY_MINUTES",
  "THIRTY_PLUS_MINUTES",
  "ONE_HOUR",
] as const;

interface CreateRequestValues {
  title: string;
  region1Depth: string;
  specificPlace: string;
  location: { latitude: number; longitude: number } | null;
  scheduledAt: string;
  shootingDuration: ShootingDuration;
  requestMessage: string;
}

export default function CreateBottomSheetDetailsStep() {
  const { handleSubmit, watch, formState, control, reset: formReset } = useReservationFormContext();
  const createMutation = useCreateReservation();
  const [, setSearchParams] = useSearchParams();
  const resetStep = useReservationCreateStepStore((s) => s.reset);

  const title = watch("title");
  const requestMessage = watch("requestMessage");

  const handleClose = useCallback(() => {
    setSearchParams({});
    resetStep();
    formReset();
  }, [setSearchParams, resetStep, formReset]);

  const onSubmit = useCallback(
    (values: CreateRequestValues) => {
      if (!values.location) return;

      createMutation.mutate(
        {
          title: values.title,
          region1Depth: values.region1Depth,
          specificPlace: values.specificPlace,
          location: values.location,
          scheduledAt: values.scheduledAt,
          shootingDuration: values.shootingDuration,
          requestMessage: values.requestMessage || undefined,
        },
        {
          onSuccess: () => {
            Toast.show({ type: "success", message: "동행 요청이 완료됐어요." });
            handleClose();
          },
          onError: () => {
            Toast.show({ type: "error", message: "동행 요청에 실패했어요." });
          },
        }
      );
    },
    [createMutation, handleClose]
  );

  const isValid =
    !!title?.trim() &&
    !!requestMessage?.trim() &&
    !formState.errors.title &&
    !formState.errors.requestMessage;

  const handleRequestSubmit = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-2">
        <span className="text-heading-2 font-bold text-gray-900">촬영 예상 소요 시간</span>
        <div className="flex flex-wrap gap-2">
          <Controller
            control={control}
            name="shootingDuration"
            render={({ field }) => (
              <>
                {SHOOTING_DURATION_OPTIONS.map((value) => (
                  <ChipButton
                    key={value}
                    selected={field.value === value}
                    onClick={() => field.onChange(value)}
                  >
                    {SHOOTING_DURATION_LABELS[value]}
                  </ChipButton>
                ))}
              </>
            )}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-heading-2 font-bold text-gray-900">
            제목 <span className="text-warning-500">*</span>
          </span>
          <span
            className={`text-label-2 font-light ${title?.length > 0 ? "text-mint-500" : "text-gray-500"}`}
          >
            ({title?.length ?? 0}/{TITLE_MAX})
          </span>
        </div>
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <input
              {...field}
              type="text"
              maxLength={TITLE_MAX}
              placeholder="ex. 홍대에서 사진 동행 구해요"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-body-2 text-gray-900 placeholder:text-gray-400"
              aria-invalid={!!fieldState.error}
            />
          )}
        />
        {formState.errors.title && (
          <span className="text-caption-2 text-warning-500">{formState.errors.title.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-heading-2 font-bold text-gray-900">
            요청메시지 <span className="text-warning-500">*</span>
          </span>
          <span
            className={`text-label-2 font-light ${requestMessage?.length > 0 ? "text-mint-500" : "text-gray-500"}`}
          >
            ({requestMessage?.length ?? 0}/{REQUEST_MESSAGE_MAX})
          </span>
        </div>
        <Controller
          control={control}
          name="requestMessage"
          render={({ field, fieldState }) => (
            <TextArea
              {...field}
              value={field.value}
              onChange={field.onChange}
              maxLength={REQUEST_MESSAGE_MAX}
              placeholder="ex. 느좋사진 잘 찍는 여성분으로 구합니다!"
              rows={4}
              status={fieldState.error ? "error" : "default"}
            />
          )}
        />
        {formState.errors.requestMessage && (
          <span className="text-caption-2 text-warning-500">
            {formState.errors.requestMessage.message}
          </span>
        )}
      </div>

      <Button.Primary
        type="button"
        onClick={(e) => {
          e.preventDefault();
          handleRequestSubmit();
        }}
        disabled={!isValid || createMutation.isPending}
        className="w-full"
      >
        {createMutation.isPending ? "요청 중..." : "동행 요청하기"}
      </Button.Primary>
    </div>
  );
}
