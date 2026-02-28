import { Plus } from "lucide-react";

interface FabProps {
  onClick: () => void;
  ariaLabel?: string;
  style?: React.CSSProperties;
}

export default function Fab({ onClick, ariaLabel = "액션", style }: FabProps) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 flex justify-center transition-transform duration-300"
      style={style}
    >
      <div className="relative h-full w-full max-w-[600px]">
        <div className="pointer-events-none absolute right-5 bottom-[calc(80px+env(safe-area-inset-bottom))] flex flex-col items-end">
          <button
            type="button"
            aria-label={ariaLabel}
            onClick={onClick}
            className="pointer-events-auto flex size-14 cursor-pointer items-center justify-center rounded-full bg-mint-500 text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-transform active:bg-mint-600"
          >
            <Plus className="size-5" strokeWidth={2.3} />
          </button>
        </div>
      </div>
    </div>
  );
}
