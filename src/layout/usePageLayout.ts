import { createContext, useContext } from "react";

export type HeaderLeftAction = "back" | "close";

type HeaderShownOverride = {
  showHeader?: true;
  title?: string;
  leftAction?: HeaderLeftAction;
  onLeftActionClick?: () => void;
  showRightActions?: boolean;
};

type HeaderHiddenOverride = {
  showHeader: false;
  title?: never;
  leftAction?: never;
  onLeftActionClick?: never;
  showRightActions?: never;
};

export type PageLayoutOverride = (HeaderShownOverride | HeaderHiddenOverride) & {
  showBottomNav?: boolean;
};

type PageLayoutContextValue = {
  setLayoutOptions: (options: PageLayoutOverride) => void;
  resetLayoutOptions: () => void;
};

export const PageLayoutContext = createContext<PageLayoutContextValue | null>(null);

/*
- setLayoutOptions: 현재 페이지에서 title/showHeader/showBottomNav를 덮어쓴다.
- showRightActions로 헤더 오른쪽 아이콘 2개를 동시에 표시/숨김할 수 있다.
- resetLayoutOptions: 덮어쓴 값을 초기화해서 라우트 기본 레이아웃으로 되돌린다.
*/
export function usePageLayout() {
  const context = useContext(PageLayoutContext);

  if (!context) {
    throw new Error("usePageLayout must be used within MobileLayout.");
  }

  return context;
}
