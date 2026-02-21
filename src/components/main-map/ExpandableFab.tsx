import { LocateFixed, Search } from "lucide-react";

import { type LatLng } from "@/types/main-map/location.type";

import { useExpandableFabFlow } from "@/hooks/main-map/useExpandableFabFlow";

import ExpandableFabMenu from "@/components/main-map/ExpandableFabMenu";
import FabActionPopups from "@/components/main-map/FabActionPopups";

interface ExpandableFabProps {
  onFindCompanion: () => void;
  onOpenManualLocationSetting: () => void;
  onResolveLocation: (location: LatLng) => void;
  defaultOpenFindCompanionModal?: boolean;
}

export default function ExpandableFab({
  onFindCompanion,
  onOpenManualLocationSetting,
  onResolveLocation,
  defaultOpenFindCompanionModal = false,
}: ExpandableFabProps) {
  const {
    isFabExpanded,
    setFabExpanded,
    closeAllModals,
    openManualLocationSetting,
    handleLocationShareClick,
    handleFindCompanionButtonClick,
    handleConfirmLocationShare,
    handleConfirmFindCompanion,
    handlePauseFromFindCompanion,
  } = useExpandableFabFlow({
    onFindCompanion,
    onOpenManualLocationSetting,
    onResolveLocation,
    defaultOpenFindCompanionModal,
  });

  const fabItems = [
    {
      id: "share-location",
      label: "위치 공유",
      icon: LocateFixed,
      onClick: handleLocationShareClick,
    },
    {
      id: "find-companion",
      label: "동행 찾기",
      icon: Search,
      onClick: handleFindCompanionButtonClick,
    },
  ] as const;

  return (
    <>
      <ExpandableFabMenu
        isExpanded={isFabExpanded}
        items={fabItems}
        onToggle={() => setFabExpanded(!isFabExpanded)}
        onClose={() => setFabExpanded(false)}
      />

      <FabActionPopups
        onCloseAll={closeAllModals}
        onConfirmLocationShare={handleConfirmLocationShare}
        onPauseFromLocationShare={openManualLocationSetting}
        onConfirmFindCompanion={handleConfirmFindCompanion}
        onPauseFromFindCompanion={handlePauseFromFindCompanion}
      />
    </>
  );
}
