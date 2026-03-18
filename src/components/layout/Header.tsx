import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Bell, ChevronLeft, Menu, X } from "lucide-react";

import { usePageLayoutStore } from "@/store/layout/pageLayout.store";

type HeaderProps = {
  onMenuClick?: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { showHeader, title, leftAction, onLeftActionClick, showRightActions } = usePageLayoutStore(
    (state) => state.layout
  );

  const defaultCloseOrBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  }, [navigate]);

  if (!showHeader) {
    return null;
  }

  const handleLeftActionClick = onLeftActionClick ?? (leftAction ? defaultCloseOrBack : undefined);

  const leftIcon =
    leftAction === "back" ? <ChevronLeft className="h-5 w-5" strokeWidth={1.9} /> : null;
  const closeIcon = leftAction === "close" ? <X className="h-5 w-5" strokeWidth={1.9} /> : null;

  return (
    <header className="sticky top-0 z-10 h-14 border-b border-gray-100 bg-white px-4">
      <div className="flex h-full items-center justify-between gap-2">
        <div className="flex flex-row items-center gap-2">
          {leftAction ? (
            <button
              type="button"
              aria-label={leftAction === "back" ? "뒤로가기" : "닫기"}
              onClick={handleLeftActionClick}
              className="cursor-pointer rounded-md text-gray-700"
            >
              {leftIcon}
              {closeIcon}
            </button>
          ) : null}
          {title ? <h1 className="truncate text-heading-3 font-bold">{title}</h1> : null}
        </div>

        <div className="flex w-[72px] shrink-0 items-center justify-end gap-1">
          {showRightActions ? (
            <>
              <button
                type="button"
                aria-label="알림"
                className="cursor-pointer rounded-md p-2 text-gray-700"
              >
                <Bell className="h-5 w-5" strokeWidth={1.9} />
              </button>
              <button
                type="button"
                aria-label="메뉴"
                onClick={onMenuClick}
                className="cursor-pointer rounded-md p-2 text-gray-700"
              >
                <Menu className="h-5 w-5" strokeWidth={1.9} />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
