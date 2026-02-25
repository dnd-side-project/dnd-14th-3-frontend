import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { z } from "zod";

import axios from "axios";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { type LatLng } from "@/types/main-map/location.type";
import { type MapPhase } from "@/types/main-map/map-phase.type";
import { type MatchExpectedDuration } from "@/types/main-map/match-request.type";

import {
  cancelMatchRequestApi,
  connectMatchSseApi,
  type MatchProposalEventData,
  type MatchSessionEventData,
  type SseConnection,
} from "@/api/main-map";

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
import { logger } from "@/lib/shared/logger";

const companionRequestSchema = z.object({
  expectedDuration: z.enum(["TEN_MINUTES", "TWENTY_MINUTES", "OVER_THIRTY_MINUTES"]).nullable(),
  requestMessage: z.string().max(200, "Request message must be 200 characters or fewer."),
});

type CompanionRequestFormValues = z.infer<typeof companionRequestSchema>;

export function useMainMapController() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [phase, setPhase] = useState<MapPhase>("idle");
  const [isCancellingMatchRequest, setIsCancellingMatchRequest] = useState(false);
  const [matchProposal, setMatchProposal] = useState<MatchProposalEventData | null>(null);
  const [matchSession, setMatchSession] = useState<MatchSessionEventData | null>(null);
  const persistedLocation = useMainMapLocationStore((state) => state.selectedLocation);
  const setPersistedLocation = useMainMapLocationStore((state) => state.setSelectedLocation);
  const setLayoutOptions = usePageLayoutStore((state) => state.setLayoutOptions);
  const resetLayoutOptions = usePageLayoutStore((state) => state.resetLayoutOptions);
  const currentLocationSheet = useBottomSheet();
  const companionRequestSheet = useBottomSheet();
  const sseConnectionRef = useRef<SseConnection | null>(null);
  const isManualSearchPage = searchParams.get("manualSearch") === "1";
  const wasManualLocationModeRef = useRef(false);
  const isManualLocationPhase = phase === "manual-location-setting";
  const isCurrentLocationSheetOpen = phase === "location-setting";
  const isCompanionRequestSheetOpen = phase === "requesting-companion";
  const isMatchingWaitSheetOpen = phase === "matching-in-progress";

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
      Toast.hide();
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
    },
    [handleResolveLocation]
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

  useEffect(() => {
    return () => {
      sseConnectionRef.current?.close();
      sseConnectionRef.current = null;
    };
  }, []);

  const handleCancelMatchingRequest = useCallback(async () => {
    if (isCancellingMatchRequest) return;

    setIsCancellingMatchRequest(true);
    try {
      await cancelMatchRequestApi();
      logger.info("[match-request] cancelled");
      sseConnectionRef.current?.close();
      sseConnectionRef.current = null;
      setMatchProposal(null);
      setMatchSession(null);
      transitionPhase("idle");
      Toast.show({
        type: "success",
        message: "매칭 요청을 취소했어요.",
        duration: 2500,
      });
    } catch (error) {
      const apiMessage = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      logger.error(error, { tag: "match-request-cancel" });
      Toast.show({
        type: "error",
        message: apiMessage || "매칭 요청 취소에 실패했어요.",
        duration: 3000,
      });
    } finally {
      setIsCancellingMatchRequest(false);
    }
  }, [isCancellingMatchRequest, transitionPhase]);

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
    const payload = {
      location: {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
      },
      specificPlace,
      requestMessage: values.requestMessage.trim(),
      expectedDuration: values.expectedDuration,
    };

    logger.info("[match-request] submit from UI", payload);

    void createMatchRequest(payload)
      .then((response) => {
        logger.info("[match-request] UI success transition", {
          phaseFrom: "requesting-companion",
          phaseTo: "matching-in-progress",
          code: response.code,
          message: response.message,
          matchRequestId: response.data?.matchRequestId,
        });

        setMatchProposal(null);
        setMatchSession(null);
        sseConnectionRef.current?.close();
        sseConnectionRef.current = connectMatchSseApi({
          onOpen: () => {
            logger.info("[match-sse] connected");
          },
          onMatchProposal: (proposal) => {
            logger.info("[match-sse] match.proposal received", proposal);
            setMatchProposal(proposal);
            transitionPhase("match-success");
          },
          onMatchSession: (session) => {
            logger.info("[match-sse] match.session received", session);
            setMatchSession(session);
            transitionPhase("match-accepted");
            Toast.show({
              type: "success",
              message: "매칭이 성사되었어요.",
              duration: 3000,
            });
          },
          onError: (error) => {
            logger.error(error, { tag: "match-sse" });
            transitionPhase("match-failed");
            Toast.show({
              type: "error",
              message: "실시간 매칭 연결에 실패했어요.",
              duration: 3000,
            });
          },
        });
        transitionPhase("matching-in-progress");

        companionRequestSheet.close();
        // Toast.show({
        //   type: "success",
        //   message: response.message || "매칭 요청이 접수되었어요.",
        //   duration: 2500,
        // });
      })
      .catch((error: unknown) => {
        transitionPhase("match-failed");
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        const apiMessage = axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message
          : undefined;
        logger.error(error, {
          tag: "match-request-ui",
          status,
          apiMessage,
          payload,
        });
        sseConnectionRef.current?.close();
        sseConnectionRef.current = null;
        setMatchProposal(null);
        setMatchSession(null);

        Toast.show({
          type: "error",
          message: apiMessage || "매칭 요청에 실패했어요. 다시 시도해주세요.",
          duration: 3000,
        });
      });
  });

  const handleAcceptMatchFound = useCallback(() => {
    transitionPhase("match-accepted");
  }, [transitionPhase]);

  const handleMapCreate = useCallback(
    (map: kakao.maps.Map) => {
      mapRef.current = map;
    },
    [mapRef]
  );

  const isFabVisible =
    (phase === "idle" ||
      phase === "manual-location-setting" ||
      phase === "location-setting" ||
      phase === "requesting-companion") &&
    !isManualLocationMode &&
    !isManualSearchPage;

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
    matchingWaitSheet: {
      isOpen: isMatchingWaitSheetOpen,
      isCancelling: isCancellingMatchRequest,
      cancel: () => {
        void handleCancelMatchingRequest();
      },
    },
    matchFoundSheet: {
      isOpen: phase === "match-success",
      accept: handleAcceptMatchFound,
      reject: () => {
        // TODO: wire reject API when backend endpoint is available.
      },
      close: () => transitionPhase("idle"),
    },
    acceptedMatchDetailSheet: {
      isOpen: phase === "match-accepted",
      close: () => transitionPhase("idle"),
    },
    onBottomSheetSnapChange: handleBottomSheetSnapChange,
    expandableFabActions: {
      findCompanion: handleFindCompanion,
      openManualLocationSetting: handleOpenManualLocationSetting,
      resolveLocation: handleResolveLocationWithPhase,
    },
  };
}
