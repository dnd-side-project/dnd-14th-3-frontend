import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { z } from "zod";

import axios from "axios";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { type LatLng } from "@/types/main-map/location.type";
import { type MapPhase } from "@/types/main-map/map-phase.type";
import { type MatchExpectedDuration } from "@/types/main-map/match-request.type";

import { usePageLayoutStore } from "@/store/layout/pageLayout.store";
import { useMainMapLocationStore } from "@/store/main-map/location.store";
import { Toast } from "@/store/shared/toast/toast.store";

import { useMainMapFabActions } from "@/hooks/main-map/useMainMapFabActions";
import { useMainMapState } from "@/hooks/main-map/useMainMapState";
import { useManualLocationFlow } from "@/hooks/main-map/useManualLocationFlow";
import { useManualSearchPermissionGate } from "@/hooks/main-map/useManualSearchPermissionGate";
import { useMapAddressLookup } from "@/hooks/main-map/useMapAddressLookup";
import { useBottomSheet } from "@/hooks/shared/bottom-sheet";

import { useCreateMatchRequest } from "@/queries/match";

const companionRequestSchema = z.object({
  expectedDuration: z.enum(["TEN_MINUTES", "TWENTY_MINUTES", "OVER_THIRTY_MINUTES"]).nullable(),
  requestMessage: z.string().max(200, "Request message must be 200 characters or fewer."),
});

type CompanionRequestFormValues = z.infer<typeof companionRequestSchema>;

export function useMainMapController() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [phase, setPhase] = useState<MapPhase>("idle");
  const persistedLocation = useMainMapLocationStore((state) => state.selectedLocation);
  const setPersistedLocation = useMainMapLocationStore((state) => state.setSelectedLocation);
  const setLayoutOptions = usePageLayoutStore((state) => state.setLayoutOptions);
  const resetLayoutOptions = usePageLayoutStore((state) => state.resetLayoutOptions);
  const currentLocationSheet = useBottomSheet();
  const companionRequestSheet = useBottomSheet();
  const isManualSearchPage = searchParams.get("manualSearch") === "1";
  const wasManualLocationModeRef = useRef(false);
  const isManualLocationPhase = phase === "manual-location-setting";
  const isCurrentLocationSheetOpen = phase === "location-setting";
  const isCompanionRequestSheetOpen = phase === "requesting-companion";

  const companionRequestForm = useForm<CompanionRequestFormValues>({
    resolver: zodResolver(companionRequestSchema),
    mode: "onChange",
    defaultValues: {
      expectedDuration: null,
      requestMessage: "",
    },
  });

  const selectedCompanionDuration = useWatch({
    control: companionRequestForm.control,
    name: "expectedDuration",
  });
  const companionRequestMessage =
    useWatch({
      control: companionRequestForm.control,
      name: "requestMessage",
    }) ?? "";
  const hasRequestMessageError = Boolean(companionRequestForm.formState.errors.requestMessage);

  const {
    mapCenter,
    currentLocation,
    isManualLocationMode,
    hasManualLocationInteracted,
    mapRef,
    setCurrentLocation,
    setManualLocationDraft,
    setIsManualLocationMode,
    setHasManualLocationInteracted,
    panMapToLocation,
    centerMapOnLocation,
    handleMapDragEnd: syncMapCenterOnDragEnd,
    enterManualLocationMode,
  } = useMainMapState({ persistedLocation });

  const { addressInfo, isResolvingAddress, lookupAddress } = useMapAddressLookup(
    isCurrentLocationSheetOpen
  );
  const { showManualSearchInCurrentLocationSheet } = useManualSearchPermissionGate(
    isCurrentLocationSheetOpen
  );

  const { mutateAsync: createMatchRequest, isPending: isCreatingMatchRequest } =
    useCreateMatchRequest();

  const transitionPhase = useCallback((nextPhase: MapPhase) => {
    setPhase(nextPhase);
  }, []);

  useEffect(() => {
    setIsManualLocationMode(isManualLocationPhase);
  }, [isManualLocationPhase, setIsManualLocationMode]);

  const confirmManualLocation = useCallback(
    (location: LatLng) => {
      setCurrentLocation(location);
      centerMapOnLocation(location);
      setPersistedLocation(location, "manual");
      currentLocationSheet.open();
      lookupAddress(location);
      transitionPhase("location-setting");
    },
    [
      centerMapOnLocation,
      currentLocationSheet,
      lookupAddress,
      setCurrentLocation,
      setPersistedLocation,
      transitionPhase,
    ]
  );

  const { handleManualMapDragEnd, handleManualMapClick } = useManualLocationFlow({
    isManualLocationMode,
    hasManualLocationInteracted,
    setHasManualLocationInteracted,
    setManualLocationDraft,
    setCurrentLocation,
  });

  const {
    handleFindCompanion: baseHandleFindCompanion,
    handleOpenManualLocationSetting: baseHandleOpenManualLocationSetting,
    handleResolveLocation,
  } = useMainMapFabActions({
    currentLocation,
    setIsManualLocationMode,
    centerMapOnLocation,
    openCurrentLocationSheet: () => {
      currentLocationSheet.open();
      transitionPhase("location-setting");
    },
    closeCurrentLocationSheet: () => {
      currentLocationSheet.close();
      transitionPhase("idle");
    },
    lookupAddress,
    enterManualLocationMode,
    setCurrentLocation: (location) => setCurrentLocation(location),
    setPersistedLocation,
  });

  const handleFindCompanion = useCallback(() => {
    baseHandleFindCompanion();
  }, [baseHandleFindCompanion]);

  const handleOpenManualLocationSetting = useCallback(() => {
    baseHandleOpenManualLocationSetting();
    transitionPhase("manual-location-setting");
  }, [baseHandleOpenManualLocationSetting, transitionPhase]);

  const handleResolveLocationWithPhase = useCallback(
    (location: LatLng) => {
      handleResolveLocation(location);
      transitionPhase("location-setting");
    },
    [handleResolveLocation, transitionPhase]
  );

  const handleMapDragEnd = useCallback(
    (map: kakao.maps.Map) => {
      syncMapCenterOnDragEnd(map);

      if (isManualLocationMode) {
        handleManualMapDragEnd(map);
        return;
      }

      if (!isCurrentLocationSheetOpen) return;
      const center = map.getCenter();
      const nextLocation = { lat: center.getLat(), lng: center.getLng() };
      setCurrentLocation(nextLocation);
      setPersistedLocation(nextLocation, "manual");
      lookupAddress(nextLocation);
    },
    [
      handleManualMapDragEnd,
      isCurrentLocationSheetOpen,
      isManualLocationMode,
      lookupAddress,
      setCurrentLocation,
      setPersistedLocation,
      syncMapCenterOnDragEnd,
    ]
  );

  const handleSelectSearchLocation = useCallback(
    (location: LatLng) => {
      setCurrentLocation(location);
      centerMapOnLocation(location);

      if (isManualLocationMode) {
        setManualLocationDraft(location);
      } else {
        setPersistedLocation(location, "manual");
        lookupAddress(location);
      }

      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("manualSearch");
      setSearchParams(nextParams);
      transitionPhase(isManualLocationPhase ? "manual-location-setting" : "location-setting");
    },
    [
      centerMapOnLocation,
      isManualLocationPhase,
      isManualLocationMode,
      lookupAddress,
      searchParams,
      setCurrentLocation,
      setManualLocationDraft,
      setPersistedLocation,
      setSearchParams,
      transitionPhase,
    ]
  );

  const handleConfirmManualLocation = useCallback(() => {
    if (!currentLocation) return;
    confirmManualLocation(currentLocation);
  }, [confirmManualLocation, currentLocation]);

  const handleOpenManualSearchPage = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("manualSearch", "1");
    setSearchParams(nextParams);
  }, [searchParams, setSearchParams]);

  const closeManualSearchPage = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("manualSearch");
    setSearchParams(nextParams);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!isManualLocationMode) return;
    const center = mapRef.current?.getCenter();
    if (!center) return;
    setManualLocationDraft({ lat: center.getLat(), lng: center.getLng() });
  }, [isManualLocationMode, mapRef, setManualLocationDraft]);

  useEffect(() => {
    if (!isManualLocationMode || wasManualLocationModeRef.current) return;
    Toast.show({
      message: "현재 내 위치로 핀을 이동해 주세요.",
      type: "info",
      duration: 3500,
      offsetY: 61,
    });
  }, [isManualLocationMode]);

  useEffect(() => {
    wasManualLocationModeRef.current = isManualLocationMode;
  }, [isManualLocationMode]);

  useEffect(() => {
    if (!isManualSearchPage) {
      resetLayoutOptions();
      return;
    }

    setLayoutOptions({
      leftAction: "back",
      onLeftActionClick: closeManualSearchPage,
      showRightActions: false,
      showBottomNav: false,
    });

    return () => resetLayoutOptions();
  }, [closeManualSearchPage, isManualSearchPage, resetLayoutOptions, setLayoutOptions]);

  useEffect(() => {
    if (!isManualSearchPage) return;
    if (isManualLocationMode || isCurrentLocationSheetOpen) return;
    closeManualSearchPage();
  }, [closeManualSearchPage, isCurrentLocationSheetOpen, isManualLocationMode, isManualSearchPage]);

  useEffect(() => {
    if (!isCurrentLocationSheetOpen || isManualLocationMode) return;
    const center = mapRef.current?.getCenter();
    if (!center) return;
    const nextLocation = { lat: center.getLat(), lng: center.getLng() };
    setCurrentLocation(nextLocation);
    lookupAddress(nextLocation);
  }, [isCurrentLocationSheetOpen, isManualLocationMode, lookupAddress, mapRef, setCurrentLocation]);

  useEffect(() => {
    if (!isCurrentLocationSheetOpen || !currentLocation) return;
    panMapToLocation(currentLocation);
  }, [isCurrentLocationSheetOpen, currentLocation, panMapToLocation]);

  const handleBottomSheetSnapChange = useCallback(
    (snapState: "collapsed" | "full") => {
      if (snapState !== "full" || !currentLocation) return;
      centerMapOnLocation(currentLocation);
    },
    [centerMapOnLocation, currentLocation]
  );

  const handleRetryCurrentLocation = useCallback(() => {
    if (!currentLocation) return;
    centerMapOnLocation(currentLocation);
    lookupAddress(currentLocation);
  }, [centerMapOnLocation, currentLocation, lookupAddress]);

  const handleRequestCompanion = useCallback(() => {
    companionRequestForm.reset({
      expectedDuration: null,
      requestMessage: "",
    });
    currentLocationSheet.close();
    companionRequestSheet.open();
    transitionPhase("requesting-companion");
  }, [companionRequestForm, companionRequestSheet, currentLocationSheet, transitionPhase]);

  const handleCloseCompanionRequestSheet = useCallback(() => {
    companionRequestSheet.close();
    transitionPhase("location-setting");
  }, [companionRequestSheet, transitionPhase]);

  const handleSelectCompanionDuration = useCallback(
    (duration: MatchExpectedDuration) => {
      companionRequestForm.setValue("expectedDuration", duration, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [companionRequestForm]
  );

  const handleSubmitCompanionRequest = companionRequestForm.handleSubmit((values) => {
    if (!values.expectedDuration || !currentLocation) return;

    const specificPlace =
      addressInfo?.roadAddress || addressInfo?.jibunAddress || addressInfo?.buildingName || "";

    void createMatchRequest({
      location: {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
      },
      specificPlace,
      requestMessage: values.requestMessage.trim(),
      expectedDuration: values.expectedDuration,
    })
      .then((response) => {
        companionRequestSheet.close();
        transitionPhase("matching-in-progress");
        Toast.show({
          type: "success",
          message: response.message || "Match request received.",
          duration: 2500,
        });
      })
      .catch((error: unknown) => {
        transitionPhase("match-failed");
        const apiMessage = axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message
          : undefined;

        Toast.show({
          type: "error",
          message: apiMessage || "Failed to request match. Please try again.",
          duration: 3000,
        });
      });
  });

  const handleMapCreate = useCallback(
    (map: kakao.maps.Map) => {
      mapRef.current = map;
    },
    [mapRef]
  );

  const isFabVisible =
    phase !== "matching-in-progress" && !isManualLocationMode && !isManualSearchPage;

  return {
    phase,
    transitionPhase,
    isFabVisible,
    mapCenter,
    currentLocation,
    isManualLocationMode,
    isManualSearchPage,
    isSheetOpen: isCurrentLocationSheetOpen,
    sheetKey: currentLocationSheet.key,
    addressInfo,
    isResolvingAddress,
    showManualSearchInCurrentLocationSheet,
    mapHandlers: {
      create: handleMapCreate,
      dragEnd: handleMapDragEnd,
      manualClick: handleManualMapClick,
    },
    manualActions: {
      selectSearchLocation: handleSelectSearchLocation,
      openSearchPage: handleOpenManualSearchPage,
      confirmLocation: handleConfirmManualLocation,
    },
    currentLocationActions: {
      retry: handleRetryCurrentLocation,
      request: handleRequestCompanion,
    },
    companionRequestSheet: {
      isOpen: isCompanionRequestSheetOpen,
      key: companionRequestSheet.key,
      isSubmitting: isCreatingMatchRequest,
      hasRequestMessageError,
      selectedDuration: selectedCompanionDuration,
      requestMessage: companionRequestMessage,
      close: handleCloseCompanionRequestSheet,
      selectDuration: handleSelectCompanionDuration,
      changeMessage: (message: string) =>
        companionRequestForm.setValue("requestMessage", message.slice(0, 200), {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }),
      submit: handleSubmitCompanionRequest,
    },
    onBottomSheetSnapChange: handleBottomSheetSnapChange,
    expandableFabActions: {
      findCompanion: handleFindCompanion,
      openManualLocationSetting: handleOpenManualLocationSetting,
      resolveLocation: handleResolveLocationWithPhase,
    },
  };
}
