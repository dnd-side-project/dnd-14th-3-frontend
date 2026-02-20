import { type LucideIcon,Plus, X } from "lucide-react";

interface FabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

interface ExpandableFabMenuProps {
  isExpanded: boolean;
  items: readonly FabItem[];
  onToggle: () => void;
  onClose: () => void;
}

export default function ExpandableFabMenu({
  isExpanded,
  items,
  onToggle,
  onClose,
}: ExpandableFabMenuProps) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-30 flex justify-center">
        <div
          aria-hidden="true"
          onClick={onClose}
          className={`h-full w-full max-w-[600px] bg-black/45 transition-opacity duration-200 ${
            isExpanded ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
      </div>

      <div className="pointer-events-none fixed inset-0 z-40 flex justify-center">
        <div className="relative h-full w-full max-w-[600px]">
          <div className="pointer-events-none absolute right-5 bottom-[calc(80px+env(safe-area-inset-bottom))] flex flex-col items-end gap-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  isExpanded
                    ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none translate-y-3 scale-95 opacity-0"
                }`}
                style={{ transitionDelay: isExpanded ? `${index * 45}ms` : "0ms" }}
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
              aria-label={isExpanded ? "액션 메뉴 닫기" : "액션 메뉴 열기"}
              onClick={onToggle}
              className={`cursor-pointer pointer-events-auto flex size-14 items-center justify-center rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all active:scale-95 ${
                isExpanded ? "bg-white text-mint-600" : "bg-mint-500 text-white"
              }`}
            >
              {isExpanded ? (
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
