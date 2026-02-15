import { useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { usePageLayoutStore } from "@/store/layout/pageLayout.store";

import BottomNavigation from "@/components/layout/BottomNavigation";
import Header from "@/components/layout/Header";

import { getRouteLayoutMeta } from "@/layout/routeLayoutMeta";

export default function MobileLayout() {
  const location = useLocation();
  const routeLayoutMeta = useMemo(() => getRouteLayoutMeta(location.pathname), [location.pathname]);
  const setLayout = usePageLayoutStore((state) => state.setLayout);
  const showBottomNav = usePageLayoutStore((state) => state.layout.showBottomNav);

  useEffect(() => {
    setLayout(routeLayoutMeta);
  }, [routeLayoutMeta, setLayout]);

  return (
    <div className="flex min-h-dvh w-full justify-center bg-gray-100">
      <div className="relative flex min-h-dvh w-full max-w-[600px] flex-col bg-white">
        <Header />
        <main className={`flex-1 ${showBottomNav ? "pb-[calc(64px+env(safe-area-inset-bottom))]" : ""}`}>
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
}
