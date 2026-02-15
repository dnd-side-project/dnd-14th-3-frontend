import { useCallback, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import BottomNavigation from "@/components/layout/BottomNavigation";
import Header from "@/components/layout/Header";

import { getRouteLayoutMeta, type RouteLayoutMeta } from "@/layout/routeLayoutMeta";
import { PageLayoutContext, type PageLayoutOverride } from "@/layout/usePageLayout";

function mergeLayoutOverride(
  prev: PageLayoutOverride,
  next: PageLayoutOverride
): PageLayoutOverride {
  const showBottomNav = next.showBottomNav ?? prev.showBottomNav;

  if (next.showHeader === false) {
    return {
      showHeader: false,
      showBottomNav,
    };
  }

  const showHeader: true | undefined =
    next.showHeader === true ? true : prev.showHeader === true ? true : undefined;

  const prevTitle = prev.showHeader === false ? undefined : prev.title;
  const prevLeftAction = prev.showHeader === false ? undefined : prev.leftAction;
  const prevOnLeftActionClick = prev.showHeader === false ? undefined : prev.onLeftActionClick;
  const prevShowRightActions = prev.showHeader === false ? undefined : prev.showRightActions;

  return {
    showHeader,
    showBottomNav,
    title: next.title ?? prevTitle,
    leftAction: next.leftAction ?? prevLeftAction,
    onLeftActionClick: next.onLeftActionClick ?? prevOnLeftActionClick,
    showRightActions: next.showRightActions ?? prevShowRightActions,
  };
}

function MobileLayoutContent({ routeLayoutMeta }: { routeLayoutMeta: RouteLayoutMeta }) {
  const navigate = useNavigate();
  const [layoutOverride, setLayoutOverride] = useState<PageLayoutOverride>({});

  const setLayoutOptions = useCallback((options: PageLayoutOverride) => {
    setLayoutOverride((prev) => mergeLayoutOverride(prev, options));
  }, []);

  const resetLayoutOptions = useCallback(() => {
    setLayoutOverride({});
  }, []);

  const title = layoutOverride.title ?? routeLayoutMeta.title;
  const showHeader = layoutOverride.showHeader ?? routeLayoutMeta.showHeader;
  const showBottomNav = layoutOverride.showBottomNav ?? routeLayoutMeta.showBottomNav;
  const leftAction = showHeader
    ? (layoutOverride.leftAction ?? routeLayoutMeta.leftAction)
    : undefined;
  const showRightActions = showHeader
    ? (layoutOverride.showRightActions ?? routeLayoutMeta.showRightActions ?? true)
    : false;
  // back과 close 모두 이전 페이지로 이동
  const defaultCloseOrBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  }, [navigate]);
  const onLeftActionClick = showHeader
    ? (layoutOverride.onLeftActionClick ?? (leftAction ? defaultCloseOrBack : undefined))
    : undefined;

  return (
    <PageLayoutContext.Provider value={{ setLayoutOptions, resetLayoutOptions }}>
      {showHeader && (
        <Header
          title={title}
          leftAction={leftAction}
          onLeftActionClick={onLeftActionClick}
          showRightActions={showRightActions}
        />
      )}
      <main
        className={`flex-1 ${showBottomNav ? "pb-[calc(64px+env(safe-area-inset-bottom))]" : ""}`}
      >
        <Outlet />
      </main>
      {showBottomNav && <BottomNavigation />}
    </PageLayoutContext.Provider>
  );
}

export default function MobileLayout() {
  const location = useLocation();
  const routeLayoutMeta = useMemo(() => getRouteLayoutMeta(location.pathname), [location.pathname]);

  return (
    <div className="flex min-h-dvh w-full justify-center bg-gray-100">
      <div className="relative flex min-h-dvh w-full max-w-[600px] flex-col bg-white">
        <MobileLayoutContent key={location.pathname} routeLayoutMeta={routeLayoutMeta} />
      </div>
    </div>
  );
}
