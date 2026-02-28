import { useCallback, useEffect, useRef, useState } from "react";

import { type LatLng } from "@/types/main-map/location.type";

import { useMainMapFabFlowStore } from "@/store/main-map/fab-flow.store";

import {
  getLocationPermissionState,
  requestCurrentLocation,
} from "@/utils/main-map/geolocation";

interface UseExpandableFabFlowParams {
  onFindCompanion: () => void;
  onOpenManualLocationSetting: () => void;
  onResolveLocation: (location: LatLng) => void;
  defaultOpenFindCompanionModal?: boolean;
}

export function useExpandableFabFlow({
  onFindCompanion,
  onOpenManualLocationSetting,
  onResolveLocation,
  defaultOpenFindCompanionModal = false,
}: UseExpandableFabFlowParams) {
  const isFabExpanded = useMainMapFabFlowStore((state) => state.isFabExpanded);
  const setFabExpanded = useMainMapFabFlowStore((state) => state.setFabExpanded);
  const closeFab = useMainMapFabFlowStore((state) => state.closeFab);
  const closeAllModals = useMainMapFabFlowStore((state) => state.closeAllModals);
  const openLocationShareSetupModal = useMainMapFabFlowStore(
    (state) => state.openLocationShareSetupModal
  );
  const openFindCompanionModal = useMainMapFabFlowStore((state) => state.openFindCompanionModal);
  const closeLocationShareSetupModal = useMainMapFabFlowStore(
    (state) => state.closeLocationShareSetupModal
  );
  const closeFindCompanionModal = useMainMapFabFlowStore((state) => state.closeFindCompanionModal);
  const didApplyDefaultModalRef = useRef(false);
  const isConfirmingLocationShareRef = useRef(false);
  const [isConfirmingLocationShare, setIsConfirmingLocationShare] = useState(false);
  const releaseLocationShareConfirmLock = useCallback(() => {
    isConfirmingLocationShareRef.current = false;
    setIsConfirmingLocationShare(false);
  }, []);

  useEffect(() => {
    if (!defaultOpenFindCompanionModal || didApplyDefaultModalRef.current) return;
    openFindCompanionModal();
    didApplyDefaultModalRef.current = true;
  }, [defaultOpenFindCompanionModal, openFindCompanionModal]);

  const openManualLocationSetting = useCallback(() => {
    closeAllModals();
    onOpenManualLocationSetting();
  }, [closeAllModals, onOpenManualLocationSetting]);

  const handleLocationShareClick = useCallback(() => {
    closeFab();
    openLocationShareSetupModal("request");
  }, [closeFab, openLocationShareSetupModal]);

  const handleFindCompanionButtonClick = useCallback(() => {
    closeFab();
    onFindCompanion();
  }, [closeFab, onFindCompanion]);

  const handleConfirmLocationShare = useCallback(async () => {
    if (isConfirmingLocationShareRef.current) return;

    isConfirmingLocationShareRef.current = true;
    setIsConfirmingLocationShare(true);

    const permissionState = await getLocationPermissionState();
    if (permissionState === "denied") {
      openLocationShareSetupModal("denied");
      releaseLocationShareConfirmLock();
      return;
    }

    const location = await requestCurrentLocation();
    if (!location) {
      const latestPermissionState = await getLocationPermissionState();
      openLocationShareSetupModal(latestPermissionState === "denied" ? "denied" : "request");
      releaseLocationShareConfirmLock();
      return;
    }

    onResolveLocation(location);
    closeLocationShareSetupModal();
    openFindCompanionModal();
    releaseLocationShareConfirmLock();
  }, [
    closeLocationShareSetupModal,
    onResolveLocation,
    openFindCompanionModal,
    openLocationShareSetupModal,
    releaseLocationShareConfirmLock,
  ]);

  const handleConfirmFindCompanion = useCallback(() => {
    onFindCompanion();
    closeAllModals();
  }, [closeAllModals, onFindCompanion]);

  const handlePauseFromFindCompanion = useCallback(() => {
    closeFindCompanionModal();
  }, [closeFindCompanionModal]);

  return {
    isFabExpanded,
    setFabExpanded,
    closeAllModals,
    openManualLocationSetting,
    handleLocationShareClick,
    handleFindCompanionButtonClick,
    handleConfirmLocationShare,
    isConfirmingLocationShare,
    handleConfirmFindCompanion,
    handlePauseFromFindCompanion,
  };
}
