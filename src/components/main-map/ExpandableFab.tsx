import { useState } from "react";

import { LocateFixed, Plus, Search, X } from "lucide-react";

const FAB_ITEMS = [
  { id: "share-location", label: "위치공유", icon: LocateFixed, onClick: () => {} },
  { id: "find-companion", label: "동행 찾기", icon: Search, onClick: () => {} },
] as const;

export default function ExpandableFab() {
  const [isFabExpanded, setIsFabExpanded] = useState(false);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-30 flex justify-center">
        <div
          aria-hidden="true"
          onClick={() => setIsFabExpanded(false)}
          className={`h-full w-full max-w-[600px] bg-black/45 transition-opacity duration-200 ${
            isFabExpanded ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
      </div>

      <div className="pointer-events-none fixed inset-0 z-40 flex justify-center">
        <div className="relative h-full w-full max-w-[600px]">
          <div className="pointer-events-none absolute right-5 bottom-[calc(80px+env(safe-area-inset-bottom))] flex flex-col items-end gap-3">
            {FAB_ITEMS.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  isFabExpanded
                    ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none translate-y-3 scale-95 opacity-0"
                }`}
                style={{ transitionDelay: isFabExpanded ? `${index * 45}ms` : "0ms" }}
              >
                <span className="relative rounded-md bg-gray-900/85 px-3 py-1.5 text-label-2 font-semibold text-white shadow-sm after:absolute after:top-1/2 after:right-[-6px] after:h-0 after:w-0 after:-translate-y-1/2 after:border-y-[6px] after:border-l-[8px] after:border-y-transparent after:border-l-gray-900/85 after:content-['']">
                  {item.label}
                </span>
                <div className="flex w-14 justify-center">
                  <button
                    type="button"
                    aria-label={item.label}
                    onClick={item.onClick}
                    className="cursor-pointer flex size-11 items-center justify-center rounded-full bg-mint-500 text-white shadow-[0_8px_16px_rgba(0,0,0,0.2)] transition-transform active:scale-95"
                  >
                    <item.icon className="size-4" strokeWidth={2.1} />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              aria-label={isFabExpanded ? "액션 메뉴 닫기" : "액션 메뉴 열기"}
              onClick={() => setIsFabExpanded((prev) => !prev)}
              className={`cursor-pointer pointer-events-auto flex size-14 items-center justify-center rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all active:scale-95 ${
                isFabExpanded ? "bg-white text-mint-600" : "bg-mint-500 text-white"
              }`}
            >
              {isFabExpanded ? (
                <X className="size-5" strokeWidth={2.3} />
              ) : (
                <Plus className="size-5" strokeWidth={2.3} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
