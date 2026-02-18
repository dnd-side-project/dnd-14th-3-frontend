import { create } from "zustand";

import type { PageLayoutOverride, ResolvedPageLayout } from "@/types/layout/page-layout.type";
import type { RouteLayoutMeta } from "@/layout/routeLayoutMeta";

type PageLayoutState = {
  baseLayout: ResolvedPageLayout;
  layout: ResolvedPageLayout;
  setLayout: (routeLayoutMeta: RouteLayoutMeta) => void;
  setLayoutOptions: (options: PageLayoutOverride) => void;
  resetLayoutOptions: () => void;
};

const hiddenLayout: ResolvedPageLayout = {
  showHeader: false,
  showBottomNav: false,
  title: undefined,
  leftAction: undefined,
  onLeftActionClick: undefined,
  showRightActions: false,
};

function toResolvedLayout(routeLayoutMeta: RouteLayoutMeta): ResolvedPageLayout {
  if (routeLayoutMeta.showHeader === false) {
    return {
      ...hiddenLayout,
      showBottomNav: routeLayoutMeta.showBottomNav,
    };
  }

  return {
    showHeader: true,
    showBottomNav: routeLayoutMeta.showBottomNav,
    title: routeLayoutMeta.title,
    leftAction: routeLayoutMeta.leftAction,
    onLeftActionClick: undefined,
    showRightActions: routeLayoutMeta.showRightActions ?? true,
  };
}

function mergeLayoutOverride(
  prevLayout: ResolvedPageLayout,
  options: PageLayoutOverride
): ResolvedPageLayout {
  const showBottomNav = options.showBottomNav ?? prevLayout.showBottomNav;

  if (options.showHeader === false) {
    return {
      ...hiddenLayout,
      showBottomNav,
    };
  }

  const showHeader = options.showHeader ?? prevLayout.showHeader;
  if (!showHeader) {
    return {
      ...hiddenLayout,
      showBottomNav,
    };
  }

  return {
    showHeader: true,
    showBottomNav,
    title: options.title ?? prevLayout.title,
    leftAction: options.leftAction ?? prevLayout.leftAction,
    onLeftActionClick: options.onLeftActionClick ?? prevLayout.onLeftActionClick,
    showRightActions: options.showRightActions ?? prevLayout.showRightActions,
  };
}

export const usePageLayoutStore = create<PageLayoutState>((set) => ({
  baseLayout: hiddenLayout,
  layout: hiddenLayout,
  setLayout: (routeLayoutMeta) => {
    const resolvedLayout = toResolvedLayout(routeLayoutMeta);
    set({
      baseLayout: resolvedLayout,
      layout: resolvedLayout,
    });
  },
  setLayoutOptions: (options) =>
    set((state) => ({
      layout: mergeLayoutOverride(state.layout, options),
    })),
  resetLayoutOptions: () =>
    set((state) => ({
      layout: state.baseLayout,
    })),
}));

