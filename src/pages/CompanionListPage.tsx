import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import type { MineSubTab } from "@/types/companion-reservation";

import { getViewSegment } from "@/lib/companion-reservation/getViewSegment";

import { FilterStoreProvider , useFilterStore } from "@/store/companion-reservation";

import { useScrollHideHeader } from "@/hooks/companion-reservation/useScrollHideHeader";

import {
  AppliedList,
  BrowseList,
  FilterArea,
  MineTabGroup,
  PostedList,
  SearchBar,
  SegmentedControl,
} from "@/components/companion-reservation";

// ─── 페이지 내부 ───────────────────────────────────────────────────
function CompanionListPageInner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = getViewSegment(searchParams.get("view"));
  const [mineSubTab, setMineSubTab] = useState<MineSubTab>("posted");
  const { values, setValues } = useFilterStore();

  const { headerRef, isHeaderVisible } = useScrollHideHeader();

  return (
    <div className="flex flex-col bg-gray-50 grow min-h-full">
      <div
        ref={headerRef}
        className="flex flex-col gap-4 px-4 py-4 bg-white sticky top-0 z-10 transition-transform duration-300"
        style={{ transform: isHeaderVisible ? "translateY(0)" : "translateY(-100%)" }}
      >
        <SegmentedControl
          activeTab={activeTab}
          onTabChange={(tab) => setSearchParams({ view: tab })}
        />
        {activeTab === "browse" ? (
          <>
            <SearchBar
              onChange={(keyword) => setValues({ ...values, keyword })}
            />
            <FilterArea />
          </>
        ) : (
          <MineTabGroup activeTab={mineSubTab} onTabChange={setMineSubTab} />
        )}
      </div>

      {activeTab === "browse" ? (
        <BrowseList />
      ) : mineSubTab === "posted" ? (
        <PostedList />
      ) : (
        <AppliedList />
      )}
    </div>
  );
}

export default function CompanionListPage() {
  return (
    <FilterStoreProvider>
      <CompanionListPageInner />
    </FilterStoreProvider>
  );
}
