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

export type ResolvedPageLayout = {
  showHeader: boolean;
  showBottomNav: boolean;
  title?: string;
  leftAction?: HeaderLeftAction;
  onLeftActionClick?: () => void;
  showRightActions: boolean;
};
