import { useState } from "react";

import { LocateFixed, Search } from "lucide-react";

import ExpandableFabMenu from "@/components/main-map/ExpandableFabMenu";
import FabActionPopups from "@/components/main-map/FabActionPopups";

type LocationPermissionState = PermissionState | "unknown";
type LatLng = { lat: number; lng: number };

interface ExpandableFabProps {
  onFindCompanion: () => void;
  onOpenManualLocationSetting: () => void;
  onResolveLocation: (location: LatLng) => void;
  defaultOpenFindCompanionModal?: boolean;
}

async function getLocationPermissionState(): Promise<LocationPermissionState> {
  if (typeof navigator === "undefined") return "unknown";

  if (typeof navigator.permissions?.query === "function") {
    try {
      const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
      return status.state;
    } catch {
      return "unknown";
    }
  }

  return "unknown";
}

async function requestLocationPermissionWithPrompt(): Promise<LatLng | null> {
  if (typeof window === "undefined" || window.location.protocol !== "https:") return null;
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
    );
  });
}

export default function ExpandableFab({
  onFindCompanion,
  onOpenManualLocationSetting,
  onResolveLocation,
  defaultOpenFindCompanionModal = false,
}: ExpandableFabProps) {
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [isLocationShareSetupModalOpen, setIsLocationShareSetupModalOpen] = useState(false);
  const [isFindCompanionModalOpen, setIsFindCompanionModalOpen] = useState(
    defaultOpenFindCompanionModal
  );

  const closeAllModals = () => {
    setIsLocationShareSetupModalOpen(false);
    setIsFindCompanionModalOpen(false);
  };

  const openManualLocationSetting = () => {
    closeAllModals();
    onOpenManualLocationSetting();
  };

  const handleLocationShareClick = async () => {
    setIsFabExpanded(false);

    const permissionState = await getLocationPermissionState();
    if (permissionState === "granted") {
      setIsFindCompanionModalOpen(true);
      return;
    }

    setIsLocationShareSetupModalOpen(true);
  };

  const handleFindCompanionButtonClick = () => {
    setIsFabExpanded(false);
    onFindCompanion();
  };

  const handleConfirmLocationShare = async () => {
    const location = await requestLocationPermissionWithPrompt();
    if (!location) return;
    onResolveLocation(location);

    setIsLocationShareSetupModalOpen(false);
    setIsFindCompanionModalOpen(true);
  };

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
        onToggle={() => setIsFabExpanded((prev) => !prev)}
        onClose={() => setIsFabExpanded(false)}
      />

      <FabActionPopups
        isLocationShareSetupModalOpen={isLocationShareSetupModalOpen}
        isFindCompanionModalOpen={isFindCompanionModalOpen}
        onCloseAll={closeAllModals}
        onConfirmLocationShare={handleConfirmLocationShare}
        onPauseFromLocationShare={openManualLocationSetting}
        onConfirmFindCompanion={() => {
          onFindCompanion();
          closeAllModals();
        }}
        onPauseFromFindCompanion={() => setIsFindCompanionModalOpen(false)}
      />
    </>
  );
}
