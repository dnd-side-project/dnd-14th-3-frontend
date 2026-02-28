import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { CalendarIcon, ChevronLeft, ClockIcon, MapPin, Search, X } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Map, useKakaoLoader } from "react-kakao-maps-sdk";

import type { ShootingDuration } from "@/types/companion-reservation";

import { extractRegion1DepthFromAddress } from "@/lib/companion-reservation/extractRegionFromAddress";
import { mergeDateAndTime } from "@/lib/companion-reservation/mergeDateAndTime";

import { SHOOTING_DURATION_LABELS } from "@/constants/companion-reservation/shooting-duration";

import {
  useReservationCreateStepStore,
  useReservationFormContext,
} from "@/store/companion-reservation";
import { Toast } from "@/store/shared/toast/toast.store";

import { useCreateReservation } from "@/queries/companion-reservation";

import BottomSheet from "../shared/bottom-sheet/BottomSheet";
import { Button } from "../shared/button";
import { Calendar } from "../shared/calendar";
import { ChipButton } from "../shared/chip-button";
import { LoadingIndicator } from "../shared/loading";
import { TextArea } from "../shared/textarea";
import { TimePicker } from "../shared/time-picker";
import LocationSearchOverlay from "./LocationSearchOverlay";

const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const PIN_ME = {
  src: "/main-map/pin_me.png",
  size: { width: 60, height: 60 },
  options: { offset: { x: 30, y: 40 } },
};
function CreateBottomSheetHeader({ onClose }: { onClose: () => void }) {
  const currentStep = useReservationCreateStepStore((s) => s.currentStep);
  const goPrev = useReservationCreateStepStore((s) => s.goPrev);

  const step = useMemo(() => {
    switch (currentStep) {
      case "location-search":
      case "location-adjust":
      case "specific-place":
        return "1/3 동행 지역";
      case "date":
      case "time":
        return "2/3 만남 날짜";
      case "details":
        return "3/3 모집 상세";
    }
  }, [currentStep]);

  const stepColor = useMemo(() => {
    switch (currentStep) {
      case "location-search":
      case "location-adjust":
      case "specific-place":
        return ["bg-mint-500", "bg-mint-50", "bg-mint-50"];
      case "date":
      case "time":
        return ["bg-mint-500", "bg-mint-500", "bg-mint-50"];
      case "details":
        return ["bg-mint-500", "bg-mint-500", "bg-mint-500"];
    }
  }, [currentStep]);
  return (
    <header className="border-b flex flex-col border-gray-100 bg-white px-4 w-full">
      <div className="h-14  bg-white px-4 w-full">
        <div className="flex h-full items-center aspect-square justify-center gap-2 w-full">
          <div className="flex h-full aspect-square shrink-0 items-center justify-start gap-1">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={goPrev}
              className="cursor-pointer rounded-md text-gray-700"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          <h1 className="truncate text-center text-heading-3 font-bold grow">{step}</h1>
          <div className="flex h-full aspect-square shrink-0 items-center justify-end gap-1">
            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="cursor-pointer rounded-md text-gray-700 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex gap-1 p-4 h-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={`flex-1 rounded-lg h-2`}>
            <div className={`w-full h-full rounded-4xl ${stepColor[index]}`} />
          </div>
        ))}
      </div>
    </header>
  );
}

export default function CreateBottomSheet() {
  const [loading, error] = useKakaoLoader({
    appkey: appKey ?? "",
    libraries: ["services"],
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const isOpen = searchParams.get("mode") === "create";
  const currentStep = useReservationCreateStepStore((s) => s.currentStep);
  const reset = useReservationCreateStepStore((s) => s.reset);
  const { reset: fromReset } = useFormContext();
  const onClose = useCallback(() => {
    setSearchParams({});
    reset();
    fromReset();
  }, [setSearchParams, reset, fromReset]);

  const renderContent = useCallback(() => {
    switch (currentStep) {
      case "location-search":
        return <CreateBottomSheetLocationSearchStep />;
      default:
        return <CreateBottomSheetLocationAdjustStep />;
    }
  }, [currentStep]);

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        initialSnap="full"
        header={() => <CreateBottomSheetHeader onClose={onClose} />}
        renderContent={() => {
          if (!appKey) {
            return (
              <div className="flex h-full items-center justify-center p-4">
                <p className="text-center text-body-2 text-warning-700">
                  {import.meta.env.DEV
                    ? "카카오맵 앱 키가 설정되지 않았어요. `.env`의 `VITE_KAKAO_MAP_APP_KEY`를 확인해 주세요."
                    : "불러올 수 없어요. 잠시 후 다시 시도해 주세요."}
                </p>
              </div>
            );
          }

          if (error) {
            return (
              <div className="flex h-full items-center justify-center p-4">
                <p className="text-center text-body-2 text-warning-700">
                  지도를 불러올 수 없어요. 잠시 후 다시 시도해 주세요.
                </p>
              </div>
            );
          }

          if (loading) {
            return (
              <div className="flex h-full items-center justify-center p-4">
                <LoadingIndicator />
              </div>
            );
          }
          return renderContent();
        }}
      />
    </>
  );
}

const CreateBottomSheetLocationSearchStep = () => {
  const [step, setStep] = useState<"full" | "collapsed">("collapsed");
  const { goNext } = useReservationCreateStepStore();
  const { setValue } = useFormContext();

  if (step === "full")
    return (
      <div className="h-[90vh] w-full flex-col">
        <LocationSearchOverlay
          onSelect={(result) => {
            setValue("location", result.location);
            setValue("specificPlace", result.address || result.title);
            const region1Depth = extractRegion1DepthFromAddress(result.address || result.title);
            if (region1Depth) setValue("region1Depth", region1Depth);
            goNext();
          }}
        />
      </div>
    );
  return (
    <div className="flex flex-col gap-4 py-4">
      <p className="text-body-2 text-gray-600">촬영 장소를 검색해주세요</p>
      <button
        type="button"
        onClick={() => setStep("full")}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-4 text-body-2 font-medium text-gray-700"
      >
        <Search size={20} className="text-gray-500" />
        지역/주소 검색
      </button>
    </div>
  );
};

function searchAddrFromCoords(
  coords: kakao.maps.LatLng,
  callback: (
    result: Array<{
      address: kakao.maps.services.Address;
      road_address: kakao.maps.services.RoadAaddress | null;
    }>,
    status: kakao.maps.services.Status
  ) => void
) {
  if (typeof window === "undefined" || !window.kakao?.maps?.services) return;
  const geocoder = new window.kakao.maps.services.Geocoder();
  geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
}

function CreateBottomSheetLocationAdjustStep() {
  const currentStep = useReservationCreateStepStore((s) => s.currentStep);
  const { control, setValue, register } = useReservationFormContext();
  const location = useWatch({ control, name: "location" });
  const { goNext } = useReservationCreateStepStore();
  const [currentBuildingAddress, setCurrentBuildingAddress] = useState<string>("");
  const [currentRoadAddress, setCurrentRoadAddress] = useState<string>("");

  const updateLocationAndAddress = useCallback(
    (latlng: kakao.maps.LatLng) => {
      const newLocation = {
        latitude: latlng.getLat(),
        longitude: latlng.getLng(),
      };
      setValue("location", newLocation);

      searchAddrFromCoords(latlng, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const addressName = result[0]?.address?.address_name ?? "";
          const detailAddr =
            (result[0]?.road_address?.building_name ?? addressName) || "유효하지 않은 위치에요!";
          setCurrentBuildingAddress(result[0]?.road_address?.building_name ?? "");
          setCurrentRoadAddress(addressName);
          if (detailAddr) setValue("specificPlace", detailAddr);
          const region1Depth = extractRegion1DepthFromAddress(addressName);
          if (region1Depth) setValue("region1Depth", region1Depth);
        }
      });
    },
    [setValue]
  );

  useEffect(() => {
    if (
      !location ||
      currentStep === "details" ||
      typeof window === "undefined" ||
      !window.kakao?.maps
    )
      return;
    const latlng = new window.kakao.maps.LatLng(location.latitude, location.longitude);
    searchAddrFromCoords(latlng, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const addressName = result[0]?.address?.address_name ?? "";
        const detailAddr =
          (result[0]?.road_address?.building_name ?? addressName) || "유효하지 않은 위치에요!";
        setCurrentBuildingAddress(result[0]?.road_address?.building_name ?? "");
        setCurrentRoadAddress(addressName);
        if (detailAddr) setValue("specificPlace", detailAddr);
        const region1Depth = extractRegion1DepthFromAddress(addressName);
        if (region1Depth) setValue("region1Depth", region1Depth);
      }
    });
  }, [location, currentStep, setValue]);

  const handleMapDragEnd = useCallback(
    (map: kakao.maps.Map) => {
      updateLocationAndAddress(map.getCenter());
    },
    [updateLocationAndAddress]
  );
  const handleMapCreate = useCallback((map: kakao.maps.Map) => {
    map.setDraggable(true);
  }, []);
  const handleMapClick = useCallback(
    (_map: kakao.maps.Map, mouseEvent: kakao.maps.event.MouseEvent) => {
      updateLocationAndAddress(mouseEvent.latLng);
    },
    [updateLocationAndAddress]
  );

  const pickerStepContent = () => {
    return (
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <MapPin size={20} className="fill-gray-900" />
          <span className="text-heading-2 font-bold text-gray-900">촬영 장소를 조정해주세요</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="px-2 pt-2 text-heading-2 font-bold text-gray-900 min-h-9">
            {currentBuildingAddress}
          </span>
          <span className="pb-2 px-2 text-body-1 text-gray-600 min-h-6">{currentRoadAddress}</span>
        </div>
        <Button.Primary onClick={() => goNext()}>촬영 장소 결정</Button.Primary>
      </div>
    );
  };

  const specificPlaceStepContent = () => {
    return (
      <div className="flex flex-col gap-2 p-4">
        <p className="text-body-2 text-gray-600">촬영 주소를 기입해주세요</p>
        <input
          {...register("specificPlace")}
          type="text"
          placeholder="촬영 주소를 기입해주세요"
          className="w-full rounded-lg border border-gray-200 bg-white py-4 text-body-2 font-medium text-gray-700"
        />
        <Button.Primary onClick={() => goNext()}>촬영 주소 결정</Button.Primary>
      </div>
    );
  };

  const dateStepContent = () => {
    return (
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <CalendarIcon size={20} className="text-gray-900" />
          <span className="text-heading-2 font-bold text-gray-900">동행 날짜를 선택해주세요</span>
        </div>
        <div className="py-8 min-h-[40vh]">
          <Controller
            control={control}
            name="scheduledAt"
            render={({ field }) => (
              <Calendar
                selectedDate={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date ? date.toISOString() : "")}
              />
            )}
          />
        </div>
        <Button.Primary onClick={() => goNext()}>날짜 결정</Button.Primary>
      </div>
    );
  };

  const timeStepContent = () => {
    return (
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <ClockIcon size={20} className="text-gray-900" />
          <span className="text-heading-2 font-bold text-gray-900">동행 시간 선택해주세요</span>
        </div>
        <div className="py-8">
          <Controller
            control={control}
            name="scheduledAt"
            render={({ field }) => {
              const baseDate = field.value ? new Date(field.value) : new Date();
              return (
                <TimePicker
                  value={baseDate}
                  onChange={(time) => {
                    if (!time) return;
                    const merged = mergeDateAndTime(baseDate, time);
                    field.onChange(merged.toISOString());
                  }}
                />
              );
            }}
          />
        </div>
        <Button.Primary onClick={() => goNext()}>시간 결정</Button.Primary>
      </div>
    );
  };

  const detailsStepContent = () => <CreateBottomSheetDetailsStep />;
  const stepContent = () => {
    switch (currentStep) {
      case "location-adjust":
        return pickerStepContent();
      case "specific-place":
        return specificPlaceStepContent();
      case "date":
        return dateStepContent();
      case "time":
        return timeStepContent();
      case "details":
        return detailsStepContent();
    }
  };

  if (!location) return null;
  return (
    <div className="flex flex-col h-[90vh] gap-4 py-4">
      <Map
        center={{ lat: location.latitude, lng: location.longitude }}
        level={3}
        draggable={currentStep === "location-adjust"}
        onDragEnd={handleMapDragEnd}
        onCreate={handleMapCreate}
        onClick={handleMapClick}
        style={{ width: "100%", height: "100%" }}
      />

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-[78%]">
        <img
          src={PIN_ME.src}
          width={PIN_ME.size.width}
          height={PIN_ME.size.height}
          alt=""
          aria-hidden
        />
      </div>
      <BottomSheet
        isOpen={true}
        showBackdrop={false}
        backdropClick="none"
        draggable={false}
        dragToClose={false}
        initialSnap="full"
        onClose={() => {}}
        renderContent={stepContent}
      />
    </div>
  );
}

const TITLE_MAX = 50;
const REQUEST_MESSAGE_MAX = 200;

const SHOOTING_DURATION_OPTIONS = [
  "TEN_MINUTES",
  "TWENTY_MINUTES",
  "THIRTY_PLUS_MINUTES",
  "ONE_HOUR",
] as const;

function CreateBottomSheetDetailsStep() {
  const { handleSubmit, watch, formState, control } = useReservationFormContext();
  const createMutation = useCreateReservation();
  const [, setSearchParams] = useSearchParams();
  const reset = useReservationCreateStepStore((s) => s.reset);
  const { reset: formReset } = useFormContext();

  const title = watch("title");
  const requestMessage = watch("requestMessage");

  const handleClose = useCallback(() => {
    setSearchParams({});
    reset();
    formReset();
  }, [setSearchParams, reset, formReset]);

  const onSubmit = useCallback(
    (values: {
      title: string;
      region1Depth: string;
      specificPlace: string;
      location: { latitude: number; longitude: number } | null;
      scheduledAt: string;
      shootingDuration: ShootingDuration;
      requestMessage: string;
    }) => {
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
      {/* 촬영 예상 소요 시간 */}
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

      {/* 제목 */}
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

      {/* 요청메시지 */}
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
