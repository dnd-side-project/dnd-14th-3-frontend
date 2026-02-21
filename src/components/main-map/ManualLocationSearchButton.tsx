import { Search } from "lucide-react";

interface ManualLocationSearchButtonProps {
  onClick: () => void;
  className?: string;
}

// 검색창으로 이동하는 버튼
export default function ManualLocationSearchButton({
  onClick,
  className = "",
}: ManualLocationSearchButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 w-full cursor-pointer items-center gap-2 rounded-lg bg-gray-100 px-4 text-left text-label-1 text-gray-700 ${className}`}
    >
      <Search size={18} className="text-gray-500" />내 위치 검색
    </button>
  );
}
