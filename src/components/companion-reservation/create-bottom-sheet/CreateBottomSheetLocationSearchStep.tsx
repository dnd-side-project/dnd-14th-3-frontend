import { useState } from "react";

import { Search } from "lucide-react";

import { extractRegion1DepthFromAddress } from "@/lib/companion-reservation/extractRegionFromAddress";

import {
  useReservationCreateStepStore,
  useReservationFormContext,
} from "@/store/companion-reservation";

import LocationSearchOverlay from "../LocationSearchOverlay";

export default function CreateBottomSheetLocationSearchStep() {
  const [step, setStep] = useState<"full" | "collapsed">("collapsed");
  const { goNext } = useReservationCreateStepStore();
  const { setValue } = useReservationFormContext();

  if (step === "full") {
    return (
      <div className="h-[90vh] w-full flex-col">
        <LocationSearchOverlay
          onSelect={(result) => {
            const selectedAddress = result.address || result.title;
            setValue("location", result.location);
            setValue("specificPlace", selectedAddress);

            const region1Depth = extractRegion1DepthFromAddress(selectedAddress);
            if (region1Depth) {
              setValue("region1Depth", region1Depth);
            }

            goNext();
          }}
        />
      </div>
    );
  }

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
}
