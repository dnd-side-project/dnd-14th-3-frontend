import { useCallback, useEffect, useMemo, useState } from "react";

import { CalendarIcon, ClockIcon, MapPin } from "lucide-react";
import { Controller, useWatch } from "react-hook-form";
import { Map } from "react-kakao-maps-sdk";

import { extractRegion1DepthFromAddress } from "@/lib/companion-reservation/extractRegionFromAddress";
import { mergeDateAndTime } from "@/lib/companion-reservation/mergeDateAndTime";
import {
  resolveAddressInfo,
  searchAddrFromCoords,
} from "@/lib/companion-reservation/reverseGeocode";

import {
  useReservationCreateStepStore,
  useReservationFormContext,
} from "@/store/companion-reservation";

import BottomSheet from "@/components/shared/bottom-sheet/BottomSheet";
import { Button } from "@/components/shared/button";
import { Calendar } from "@/components/shared/calendar";
import { TimePicker } from "@/components/shared/time-picker";

import CreateBottomSheetDetailsStep from "./CreateBottomSheetDetailsStep";

const PIN_ME = {
  src: "/main-map/pin_me.png",
  size: { width: 60, height: 60 },
};

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toKstISOString(date: Date) {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString();
}

function fromKstISOString(value: string) {
  return new Date(new Date(value).getTime() - KST_OFFSET_MS);
}

export default function CreateBottomSheetLocationAdjustStep() {
  const currentStep = useReservationCreateStepStore((s) => s.currentStep);
  const { control, setValue, register } = useReservationFormContext();
  const location = useWatch({ control, name: "location" });
  const { goNext } = useReservationCreateStepStore();

  const [currentBuildingAddress, setCurrentBuildingAddress] = useState("");
  const [currentRoadAddress, setCurrentRoadAddress] = useState("");
  const today = useMemo(() => {
    const now = new Date().getTime() + KST_OFFSET_MS;
    return new Date(now);
  }, []);

  const syncAddressFromLatLng = useCallback(
    (latlng: kakao.maps.LatLng) => {
      searchAddrFromCoords(latlng, (result, status) => {
        if (status !== window.kakao.maps.services.Status.OK) return;

        const { addressName, buildingName, specificPlace } = resolveAddressInfo(result);
        setCurrentBuildingAddress(buildingName);
        setCurrentRoadAddress(addressName);
        setValue("specificPlace", specificPlace || "");

        const region1Depth = extractRegion1DepthFromAddress(addressName);
        if (region1Depth) {
          setValue("region1Depth", region1Depth);
        }
      });
    },
    [setValue]
  );

  const updateLocationAndAddress = useCallback(
    (latlng: kakao.maps.LatLng) => {
      setValue("location", {
        latitude: latlng.getLat(),
        longitude: latlng.getLng(),
      });

      syncAddressFromLatLng(latlng);
    },
    [setValue, syncAddressFromLatLng]
  );

  useEffect(() => {
    if (
      !location ||
      currentStep === "details" ||
      typeof window === "undefined" ||
      !window.kakao?.maps
    ) {
      return;
    }

    const latlng = new window.kakao.maps.LatLng(location.latitude, location.longitude);
    syncAddressFromLatLng(latlng);
  }, [location, currentStep, syncAddressFromLatLng]);

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

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case "location-adjust":
        return (
          <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-gray-900" />
              <span className="text-heading-2 font-bold text-gray-900">
                촬영 장소를 조정해주세요
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="px-2 pt-2 text-heading-2 font-bold text-gray-900 min-h-9">
                {currentBuildingAddress}
              </span>
              <span className="pb-2 px-2 text-body-1 text-gray-600 min-h-6">
                {currentRoadAddress}
              </span>
            </div>
            <Button.Primary onClick={() => goNext()}>촬영 장소 결정</Button.Primary>
          </div>
        );

      case "specific-place":
        return (
          <div className="flex flex-col gap-2 p-4">
            <p className="text-body-2 text-gray-600">촬영 주소를 기입해주세요</p>
            <input
              {...register("specificPlace")}
              type="text"
              placeholder="촬영 주소를 기입해주세요"
              className="px-2 w-full rounded-lg border border-gray-200 bg-white py-4 text-body-2 font-medium text-gray-700"
            />
            <Button.Primary onClick={() => goNext()}>촬영 주소 결정</Button.Primary>
          </div>
        );

      case "date":
        return (
          <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon size={20} className="text-gray-900" />
              <span className="text-heading-2 font-bold text-gray-900">
                동행 날짜를 선택해주세요
              </span>
            </div>
            <div className="py-8 min-h-[40vh]">
              <Controller
                control={control}
                name="scheduledAt"
                render={({ field }) => (
                  <Calendar
                    selectedDate={field.value ? fromKstISOString(field.value) : null}
                    onChange={(date) => field.onChange(date ? toKstISOString(date) : "")}
                    minDate={new Date(today.getTime() + 24 * 60 * 60 * 1000)}
                  />
                )}
              />
            </div>
            <Button.Primary onClick={() => goNext()}>날짜 결정</Button.Primary>
          </div>
        );

      case "time":
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
                  const baseDate = field.value ? fromKstISOString(field.value) : new Date();
                  return (
                    <TimePicker
                      value={baseDate}
                      onChange={(time) => {
                        if (!time) return;
                        const merged = mergeDateAndTime(baseDate, time);
                        field.onChange(toKstISOString(merged));
                      }}
                      minuteStep={30}
                    />
                  );
                }}
              />
            </div>
            <Button.Primary onClick={() => goNext()}>시간 결정</Button.Primary>
          </div>
        );

      case "details":
        return <CreateBottomSheetDetailsStep />;

      default:
        return null;
    }
  }, [control, currentBuildingAddress, currentRoadAddress, currentStep, goNext, register, today]);

  if (!location) {
    return null;
  }

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
        renderContent={() => stepContent}
      />
    </div>
  );
}
