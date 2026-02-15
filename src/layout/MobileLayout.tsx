import { useCallback, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import BottomNavigation from "@/components/layout/BottomNavigation";
import Header from "@/components/layout/Header";

import { getRouteLayoutMeta, type RouteLayoutMeta } from "@/layout/routeLayoutMeta";
import { PageLayoutContext, type PageLayoutOverride } from "@/layout/usePageLayout";

function MobileLayoutContent({ routeLayoutMeta }: { routeLayoutMeta: RouteLayoutMeta }) {
  const [layoutOverride, setLayoutOverride] = useState<PageLayoutOverride>({});

  const setLayoutOptions = useCallback((options: PageLayoutOverride) => {
    setLayoutOverride((prev) => ({ ...prev, ...options }));
  }, []);

  const resetLayoutOptions = useCallback(() => {
    setLayoutOverride({});
  }, []);

  const title = layoutOverride.title ?? routeLayoutMeta.title;
  const showHeader = layoutOverride.showHeader ?? routeLayoutMeta.showHeader;
  const showBottomNav = layoutOverride.showBottomNav ?? routeLayoutMeta.showBottomNav;

  return (
    <PageLayoutContext.Provider value={{ setLayoutOptions, resetLayoutOptions }}>
      {showHeader && <Header title={title} />}
      <main className={`flex-1 ${showBottomNav ? "pb-[calc(64px+env(safe-area-inset-bottom))]" : ""}`}>
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
