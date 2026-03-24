import { useMemo } from "react";

import { ChevronLeft, X } from "lucide-react";

import { CREATE_BOTTOM_SHEET_STEP_META } from "@/constants/companion-reservation/create-bottom-sheet-step-meta";

import { useReservationCreateStepStore } from "@/store/companion-reservation";

interface CreateBottomSheetHeaderProps {
  onClose: () => void;
}

export default function CreateBottomSheetHeader({ onClose }: CreateBottomSheetHeaderProps) {
  const currentStep = useReservationCreateStepStore((s) => s.currentStep);
  const goPrev = useReservationCreateStepStore((s) => s.goPrev);

  const stepMeta = useMemo(() => {
    return CREATE_BOTTOM_SHEET_STEP_META[currentStep];
  }, [currentStep]);

  return (
    <header className="border-b flex flex-col border-gray-100 bg-white px-4 w-full">
      <div className="h-14 bg-white px-4 w-full">
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
          <h1 className="truncate text-center text-heading-3 font-bold grow">{stepMeta.label}</h1>
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
          <div key={index} className="flex-1 rounded-lg h-2">
            <div className={`w-full h-full rounded-4xl ${stepMeta.progressColors[index]}`} />
          </div>
        ))}
      </div>
    </header>
  );
}
