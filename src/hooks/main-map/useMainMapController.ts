import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { z } from "zod";

import axios from "axios";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import SockJS from "sockjs-client";

import { type LatLng } from "@/types/main-map/location.type";
import { type MapPhase } from "@/types/main-map/map-phase.type";
import { type MatchExpectedDuration } from "@/types/main-map/match-request.type";

import { logger } from "@/lib/shared/logger";
import { createMockSessionSocket } from "@/mocks/ws/sessionSocket.mock";

import { getAccessToken } from "@/api/client";
import { connectMatchSseApi } from "@/api/main-map/sse.api";
import {
  type MatchProposalEventData,
  type MatchRequestExpiredEventData,
  type MatchRequestWaitingCountEventData,
  type MatchSessionEventData,
  type SseConnection,
} from "@/types/main-map";

import { getUserIdFromToken } from "@/services/auth/getUserIdFromToken.service";

import { usePageLayoutStore } from "@/store/layout/pageLayout.store";
import { useMainMapLocationStore } from "@/store/main-map/location.store";
import { useMainMapSessionLocationStore } from "@/store/main-map/session-location.store";
import { Toast } from "@/store/shared/toast/toast.store";

import { useMainMapFabActions } from "@/hooks/main-map/useMainMapFabActions";
import { useMainMapState } from "@/hooks/main-map/useMainMapState";
import { useManualLocationFlow } from "@/hooks/main-map/useManualLocationFlow";
import { useManualSearchPermissionGate } from "@/hooks/main-map/useManualSearchPermissionGate";
import { useMapAddressLookup } from "@/hooks/main-map/useMapAddressLookup";
import { useBottomSheet } from "@/hooks/shared/bottom-sheet";

import {
  useAcceptMatchProposal,
  useArriveMatchSession,
  useCancelMatchRequest,
  useCreateMatchRequest,
  useGetMatchSession,
  useRejectMatchProposal,
  useRetryMatchRequest,
} from "@/queries/match";

const companionRequestSchema = z.object({
  expectedDuration: z.enum(["TEN_MINUTES", "TWENTY_MINUTES", "OVER_THIRTY_MINUTES"]).nullable(),
  requestMessage: z.string().max(200, "Request message must be 200 characters or fewer."),
});

type CompanionRequestFormValues = z.infer<typeof companionRequestSchema>;

const MATCH_FLOW_STORAGE_KEY = "main-map-match-flow-v1";
const MATCH_FLOW_TTL_MS = 30 * 60 * 1000;
const MAX_MATCH_RETRY_COUNT = 2;
const SOCKET_OPEN_STATE = 1;

type SessionSocketMessageType = "LOCATION" | "USER_ARRIVED" | "SESSION_READY" | "SESSION_END";

type LocationSessionSocketMessage = {
  type: "LOCATION";
  sessionId: number;
  senderId: number;
  timestamp: string;
  data: {
    latitude: number;
    longitude: number;
  };
};

type UserArrivedSessionSocketMessage = {
  type: "USER_ARRIVED";
  sessionId: number;
  senderId: number;
  timestamp: string;
  data: {
    isArrived: boolean;
  };
};

type SessionReadySocketMessage = {
  type: "SESSION_READY";
  sessionId: number;
  senderId: null;
  timestamp: string;
  data: {
    status: string;
  };
};

type SessionEndSocketMessage = {
  type: "SESSION_END";
  sessionId: number;
  senderId: number | null;
  timestamp: string;
  data: {
    status: string;
  };
};

type SessionSocketMessage =
  | LocationSessionSocketMessage
  | UserArrivedSessionSocketMessage
  | SessionReadySocketMessage
  | SessionEndSocketMessage;

type LegacyLocationSocketMessage = {
  userId: number;
  latitude: number;
  longitude: number;
  timestamp?: string;
};

type StompCompatibleSocket = {
  close: () => void;
  send: (data: string) => void;
  onopen: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onclose: ((event: CloseEvent) => void) | null;
  readyState: number;
};

function toSockJsUrl(wsUrl: string): string {
  if (wsUrl.startsWith("wss://")) return `https://${wsUrl.slice("wss://".length)}`;
  if (wsUrl.startsWith("ws://")) return `http://${wsUrl.slice("ws://".length)}`;
  return wsUrl;
}

function normalizeIncomingSessionMessage(
  raw: unknown,
  expectedSessionId: number
): SessionSocketMessage | null {
  if (!raw || typeof raw !== "object") return null;

  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.type === "string") {
    const type = candidate.type as SessionSocketMessageType;
    const sessionId = Number(candidate.sessionId);
    const senderIdRaw = candidate.senderId;
    const senderId =
      senderIdRaw == null
        ? null
        : Number.isFinite(Number(senderIdRaw))
          ? Number(senderIdRaw)
          : null;
    const timestamp = typeof candidate.timestamp === "string" ? candidate.timestamp : "";
    const data = candidate.data as Record<string, unknown> | undefined;

    if (!Number.isFinite(sessionId) || sessionId !== expectedSessionId || !data) return null;

    if (type === "LOCATION") {
      const latitude = Number(data.latitude);
      const longitude = Number(data.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || senderId == null)
        return null;
      return {
        type,
        sessionId,
        senderId,
        timestamp,
        data: { latitude, longitude },
      };
    }

    if (type === "USER_ARRIVED") {
      if (typeof data.isArrived !== "boolean" || senderId == null) return null;
      return {
        type,
        sessionId,
        senderId,
        timestamp,
        data: { isArrived: data.isArrived },
      };
    }

    if (type === "SESSION_READY") {
      if (typeof data.status !== "string") return null;
      return {
        type,
        sessionId,
        senderId: null,
        timestamp,
        data: { status: data.status },
      };
    }

    if (type === "SESSION_END") {
      if (typeof data.status !== "string") return null;
      return {
        type,
        sessionId,
        senderId,
        timestamp,
        data: { status: data.status },
      };
    }
  }

  const legacy = raw as LegacyLocationSocketMessage;
  if (
    Number.isFinite(legacy.userId) &&
    Number.isFinite(legacy.latitude) &&
    Number.isFinite(legacy.longitude)
  ) {
    return {
      type: "LOCATION",
      sessionId: expectedSessionId,
      senderId: legacy.userId,
      timestamp: typeof legacy.timestamp === "string" ? legacy.timestamp : "",
      data: {
        latitude: legacy.latitude,
        longitude: legacy.longitude,
      },
    };
  }

  return null;
}

function toDurationLabel(duration: string | null | undefined) {
  if (duration === "TEN_MINUTES") return "10분";
  if (duration === "TWENTY_MINUTES") return "20분";
  if (duration === "OVER_THIRTY_MINUTES") return "30분 이상";
  return "미정";
}

function toGenderLabel(gender: string | null | undefined) {
  if (gender === "MALE") return "남";
  if (gender === "FEMALE") return "여";
  return "미정";
}

type PersistedMatchFlow = {
  phase: MapPhase;
  matchProposal: MatchProposalEventData | null;
  sessionId: number | null;
  expiredMatchRequest: MatchRequestExpiredEventData | null;
  isMatchExpiredModalOpen: boolean;
  wasManualLocationMode: boolean;
  updatedAt: number;
};

type UseMainMapControllerOptions = {
  isKakaoReady: boolean;
};

function loadPersistedMatchFlow(): PersistedMatchFlow | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(MATCH_FLOW_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedMatchFlow>;
    if (!parsed || typeof parsed.updatedAt !== "number") return null;
    if (Date.now() - parsed.updatedAt > MATCH_FLOW_TTL_MS) {
      window.localStorage.removeItem(MATCH_FLOW_STORAGE_KEY);
      return null;
    }

    return {
      phase: parsed.phase as MapPhase,
      matchProposal: parsed.matchProposal ?? null,
      sessionId:
        typeof parsed.sessionId === "number"
          ? parsed.sessionId
          : ((parsed as { matchSession?: { id?: number } }).matchSession?.id ?? null),
      expiredMatchRequest: parsed.expiredMatchRequest ?? null,
      isMatchExpiredModalOpen: parsed.isMatchExpiredModalOpen ?? false,
      wasManualLocationMode: Boolean(parsed.wasManualLocationMode),
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

function savePersistedMatchFlow(flow: PersistedMatchFlow) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MATCH_FLOW_STORAGE_KEY, JSON.stringify(flow));
}

export function useMainMapController({ isKakaoReady }: UseMainMapControllerOptions) {
  const persistedMatchFlowRef = useRef<PersistedMatchFlow | null>(loadPersistedMatchFlow());
  const persistedMatchFlow = persistedMatchFlowRef.current;
  const persistedFlowPhase = persistedMatchFlow?.phase ?? null;
  const persistedFlowWasManualMode = persistedMatchFlow?.wasManualLocationMode ?? false;
  const initialPhase =
    persistedFlowPhase === "requesting-companion"
      ? persistedFlowWasManualMode
        ? "manual-location-setting"
        : "location-setting"
      : (persistedFlowPhase ?? "idle");
  const [searchParams, setSearchParams] = useSearchParams();
  const [phase, setPhase] = useState<MapPhase>(initialPhase);
  const [isCancellingMatchRequest, setIsCancellingMatchRequest] = useState(false);
  const [matchProposal, setMatchProposal] = useState<MatchProposalEventData | null>(
    persistedMatchFlow?.matchProposal ?? null
  );
  const [, setMatchSession] = useState<MatchSessionEventData | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(persistedMatchFlow?.sessionId ?? null);
  const persistedSessionLocationId = useMainMapSessionLocationStore((state) => state.sessionId);
  const persistedDestination = useMainMapSessionLocationStore((state) => state.destination);
  const persistedPartnerLocation = useMainMapSessionLocationStore((state) => state.partnerLocation);
  const setSessionLocationSessionId = useMainMapSessionLocationStore((state) => state.setSessionId);
  const setPersistedDestination = useMainMapSessionLocationStore((state) => state.setDestination);
  const setPersistedPartnerLocation = useMainMapSessionLocationStore(
    (state) => state.setPartnerLocation
  );
  const clearPersistedSessionLocations = useMainMapSessionLocationStore((state) => state.clear);
  const shouldRestorePersistedSessionLocations =
    persistedMatchFlow?.sessionId != null &&
    persistedSessionLocationId === persistedMatchFlow.sessionId;
  const [expiredMatchRequest, setExpiredMatchRequest] =
    useState<MatchRequestExpiredEventData | null>(persistedMatchFlow?.expiredMatchRequest ?? null);
  const [isMatchExpiredModalOpen, setIsMatchExpiredModalOpen] = useState(
    persistedMatchFlow?.isMatchExpiredModalOpen ?? false
  );
  const [isMatchRetryLimitModalOpen, setIsMatchRetryLimitModalOpen] = useState(false);
  const [matchRetryCount, setMatchRetryCount] = useState(0);
  const matchRetryCountRef = useRef(0);
  const [isRetryingMatchRequest, setIsRetryingMatchRequest] = useState(false);
  const [isPartnerArrived, setIsPartnerArrived] = useState(false);
  const [arrivalStatusModalType, setArrivalStatusModalType] = useState<
    "partner-arrived" | "partner-moving" | null
  >(null);
  const [nearbyWaitingCount, setNearbyWaitingCount] = useState<number | null>(null);
  const [proposalRejectedSignal, setProposalRejectedSignal] = useState(0);
  const [partnerLocation, setPartnerLocation] = useState<LatLng | null>(
    shouldRestorePersistedSessionLocations ? persistedPartnerLocation : null
  );
  const [meetingLocation, setMeetingLocation] = useState<LatLng | null>(
    shouldRestorePersistedSessionLocations ? persistedDestination : null
  );
  const persistedLocation = useMainMapLocationStore((state) => state.selectedLocation);
  const [requestingManualMode, setRequestingManualMode] = useState(false);
  const setPersistedLocation = useMainMapLocationStore((state) => state.setSelectedLocation);
  const setLayoutOptions = usePageLayoutStore((state) => state.setLayoutOptions);
  const resetLayoutOptions = usePageLayoutStore((state) => state.resetLayoutOptions);
  const currentLocationSheet = useBottomSheet();
  const companionRequestSheet = useBottomSheet();
  const sseConnectionRef = useRef<SseConnection | null>(null);
  const sessionWsRef = useRef<StompCompatibleSocket | null>(null);
  const sessionWatchIdRef = useRef<number | null>(null);
  const isSessionStompConnectedRef = useRef(false);
  const sessionWsBufferRef = useRef("");
  const isManualSearchPage = searchParams.get("manualSearch") === "1";
  const wasManualLocationModeRef = useRef(false);
  const manualModeOverrideRef = useRef(false);
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
  const { mutateAsync: cancelMatchRequest } = useCancelMatchRequest();
  const { mutateAsync: retryMatchRequest } = useRetryMatchRequest();
  const { mutateAsync: acceptMatchProposal } = useAcceptMatchProposal();
  const { mutateAsync: arriveMatchSession, isPending: isArrivingMatchSession } =
    useArriveMatchSession();
  const { mutateAsync: rejectMatchProposal } = useRejectMatchProposal();
  const { data: matchSessionDetail, error: matchSessionError } = useGetMatchSession(sessionId);
  const sessionDestination = matchSessionDetail?.data?.destination;

  const partner = matchSessionDetail?.data?.partner;
  const partnerProfileText = partner
    ? `${partner.nickname} | ${toGenderLabel(partner.gender)}`
    : "상대 정보를 불러오는 중이에요.";
  const partnerExpectedDurationLabel = toDurationLabel(partner?.request?.expectedDuration);
  const partnerRequestMessage =
    partner?.request?.requestMessage?.trim() || "상대방 요청 메시지가 없어요.";

  useEffect(() => {
    if (!sessionDestination) return;
    if (
      !Number.isFinite(sessionDestination.latitude) ||
      !Number.isFinite(sessionDestination.longitude)
    ) {
      return;
    }

    setMeetingLocation({
      lat: sessionDestination.latitude,
      lng: sessionDestination.longitude,
    });
  }, [sessionDestination]);

  useEffect(() => {
    if (!sessionId) {
      clearPersistedSessionLocations();
      return;
    }

    if (persistedSessionLocationId != null && persistedSessionLocationId !== sessionId) {
      clearPersistedSessionLocations();
    }
    setSessionLocationSessionId(sessionId);
  }, [
    clearPersistedSessionLocations,
    persistedSessionLocationId,
    sessionId,
    setSessionLocationSessionId,
  ]);

  useEffect(() => {
    setIsPartnerArrived(false);
    setArrivalStatusModalType(null);
  }, [sessionId]);

  useEffect(() => {
    if (phase === "match-accepted" || phase === "moving") return;
    setArrivalStatusModalType(null);
  }, [phase]);

  useEffect(() => {
    if (!sessionId) return;
    if (persistedSessionLocationId !== sessionId) return;
    if (!meetingLocation && persistedDestination) {
      setMeetingLocation(persistedDestination);
    }
    if (!partnerLocation && persistedPartnerLocation) {
      setPartnerLocation(persistedPartnerLocation);
    }
  }, [
    meetingLocation,
    partnerLocation,
    persistedDestination,
    persistedPartnerLocation,
    persistedSessionLocationId,
    sessionId,
  ]);

  useEffect(() => {
    if (!sessionId || persistedSessionLocationId !== sessionId) return;
    setPersistedDestination(meetingLocation);
  }, [meetingLocation, persistedSessionLocationId, sessionId, setPersistedDestination]);

  useEffect(() => {
    if (!sessionId || persistedSessionLocationId !== sessionId) return;
    setPersistedPartnerLocation(partnerLocation);
  }, [partnerLocation, persistedSessionLocationId, sessionId, setPersistedPartnerLocation]);

  const transitionPhase = useCallback((nextPhase: MapPhase) => {
    setPhase(nextPhase);
  }, []);
  const phaseRef = useRef<MapPhase>(phase);
  const pendingProposalRejectedRef = useRef(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (phase !== "match-success" && phase !== "match-accepted" && phase !== "moving") return;
    if (!pendingProposalRejectedRef.current) return;
    pendingProposalRejectedRef.current = false;
    setProposalRejectedSignal((prev) => prev + 1);
  }, [phase]);

  const openMatchSseConnection = useCallback(() => {
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
      onMatchProposalRejected: (proposal) => {
        logger.info("[match-sse] match.proposal.rejected received", proposal);
        setMatchProposal(proposal);
        if (
          phaseRef.current === "match-success" ||
          phaseRef.current === "match-accepted" ||
          phaseRef.current === "moving"
        ) {
          setProposalRejectedSignal((prev) => prev + 1);
          return;
        }
        pendingProposalRejectedRef.current = true;
      },
      onMatchSession: (session) => {
        logger.info("[match-sse] match.session received", session);
        setMatchSession(session);
        setSessionId(session.id);
        transitionPhase("match-accepted");
        if (pendingProposalRejectedRef.current) {
          pendingProposalRejectedRef.current = false;
          setProposalRejectedSignal((prev) => prev + 1);
        }
      },
      onMatchRequestExpired: (expired) => {
        logger.info("[match-sse] match.request.expired received", expired);
        if (matchRetryCountRef.current >= MAX_MATCH_RETRY_COUNT) {
          setIsMatchExpiredModalOpen(false);
          setIsMatchRetryLimitModalOpen(true);
          setExpiredMatchRequest(expired);
          setMatchProposal(null);
          setMatchSession(null);
          setSessionId(null);
          sseConnectionRef.current?.close();
          sseConnectionRef.current = null;
          transitionPhase("match-failed");
          return;
        }
        setExpiredMatchRequest(expired);
        setMatchProposal(null);
        setMatchSession(null);
        setSessionId(null);
        setIsMatchExpiredModalOpen(true);
        sseConnectionRef.current?.close();
        sseConnectionRef.current = null;
        transitionPhase("match-failed");
      },
      onMatchRequestWaitingCount: (payload: MatchRequestWaitingCountEventData) => {
        logger.info("[match-sse] match.request.waiting-count received", payload);
        setNearbyWaitingCount(payload.nearbyWaitingCount);
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
  }, [transitionPhase]);

  const stopSessionLocationSharing = useCallback(() => {
    if (
      sessionWatchIdRef.current != null &&
      typeof navigator !== "undefined" &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(sessionWatchIdRef.current);
      sessionWatchIdRef.current = null;
    }
    if (sessionWsRef.current) {
      try {
        sessionWsRef.current.close();
      } catch {
        // no-op
      }
      sessionWsRef.current = null;
    }
    isSessionStompConnectedRef.current = false;
    sessionWsBufferRef.current = "";
  }, []);

  useEffect(() => {
    const shouldValidateSession = phase === "match-accepted" || phase === "moving";
    if (!shouldValidateSession || !sessionId || !matchSessionError) return;

    const status = axios.isAxiosError(matchSessionError)
      ? matchSessionError.response?.status
      : undefined;
    if (status !== 401 && status !== 404) return;

    logger.warn("[match-session] session restore failed, reset to idle", { sessionId, status });
    stopSessionLocationSharing();
    setMatchProposal(null);
    setMatchSession(null);
    setSessionId(null);
    setPartnerLocation(null);
    setMeetingLocation(null);
    transitionPhase("idle");
  }, [matchSessionError, phase, sessionId, stopSessionLocationSharing, transitionPhase]);

  const startSessionLocationSharing = useCallback(() => {
    if (phaseRef.current === "moving") return;

    const currentSessionId = sessionId;
    if (!currentSessionId) return;

    const handleSessionEventMessage = (eventMessage: SessionSocketMessage, myUserId?: number) => {
      if (eventMessage.type === "LOCATION") {
        if (myUserId != null && eventMessage.senderId === myUserId) return;
        setPartnerLocation({
          lat: eventMessage.data.latitude,
          lng: eventMessage.data.longitude,
        });
        return;
      }

      if (eventMessage.type === "USER_ARRIVED") {
        if (myUserId != null && eventMessage.senderId === myUserId) return;
        if (eventMessage.data.isArrived) {
          setIsPartnerArrived(true);
          setArrivalStatusModalType((prev) =>
            prev === "partner-moving" ? "partner-arrived" : prev
          );
        }
        logger.info("[session-ws] user arrived", eventMessage);
        return;
      }

      if (eventMessage.type === "SESSION_READY") {
        setIsPartnerArrived(true);
        setArrivalStatusModalType((prev) => (prev === "partner-moving" ? "partner-arrived" : prev));
        logger.info("[session-ws] session ready", eventMessage);
        return;
      }

      if (eventMessage.type === "SESSION_END") {
        logger.info("[session-ws] session end", eventMessage);
        stopSessionLocationSharing();
        transitionPhase("idle");
      }
    };

    const isMockMode = import.meta.env.VITE_MSW_ENABLED === "true";
    const token = getAccessToken();
    const myUserIdRaw = getUserIdFromToken();
    const myUserId = isMockMode ? 3 : myUserIdRaw ? Number(myUserIdRaw) : NaN;

    if ((!token && !isMockMode) || !Number.isFinite(myUserId)) {
      Toast.show({
        type: "error",
        message: "위치 공유를 시작할 수 없어요. 다시 시도해주세요.",
        duration: 3000,
      });
      return;
    }

    stopSessionLocationSharing();
    transitionPhase("moving");

    const wsUrl = import.meta.env.VITE_WS_BASE_URL;
    const socket = isMockMode
      ? createMockSessionSocket(currentSessionId)
      : (new SockJS(toSockJsUrl(wsUrl)) as unknown as StompCompatibleSocket);
    sessionWsRef.current = socket;

    const sendStompFrame = (command: string, headers: Record<string, string>, body = "") => {
      const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
      socket.send(`${command}\n${headerLines.join("\n")}\n\n${body}\0`);
    };

    const sendLocation = (location: LatLng) => {
      if (!isSessionStompConnectedRef.current || socket.readyState !== SOCKET_OPEN_STATE) return;
      sendStompFrame(
        "SEND",
        {
          destination: `/pub/sessions/${currentSessionId}/location`,
          "content-type": "application/json",
        },
        JSON.stringify({
          type: "LOCATION",
          sessionId: currentSessionId,
          timestamp: new Date().toISOString(),
          data: {
            latitude: location.lat,
            longitude: location.lng,
          },
          latitude: location.lat,
          longitude: location.lng,
        })
      );
    };

    socket.onopen = () => {
      sendStompFrame("CONNECT", {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "accept-version": "1.2,1.1,1.0",
        "heart-beat": "10000,10000",
      });
    };

    socket.onmessage = (event) => {
      if (typeof event.data !== "string") return;
      sessionWsBufferRef.current += event.data;

      let frameEnd = sessionWsBufferRef.current.indexOf("\0");
      while (frameEnd !== -1) {
        const rawFrame = sessionWsBufferRef.current.slice(0, frameEnd);
        sessionWsBufferRef.current = sessionWsBufferRef.current.slice(frameEnd + 1);
        frameEnd = sessionWsBufferRef.current.indexOf("\0");

        if (!rawFrame.trim()) continue;
        const [headerPart, body = ""] = rawFrame.split("\n\n");
        const headerLines = headerPart.split("\n");
        const command = headerLines[0]?.trim();
        const headers = new Map<string, string>();

        for (const line of headerLines.slice(1)) {
          const separatorIndex = line.indexOf(":");
          if (separatorIndex === -1) continue;
          const key = line.slice(0, separatorIndex).trim();
          const value = line.slice(separatorIndex + 1).trim();
          headers.set(key, value);
        }

        if (command === "CONNECTED") {
          isSessionStompConnectedRef.current = true;
          sendStompFrame("SUBSCRIBE", {
            id: `session-location-${currentSessionId}`,
            destination: `/sub/sessions/${currentSessionId}/location`,
          });

          if (typeof navigator !== "undefined" && navigator.geolocation) {
            sessionWatchIdRef.current = navigator.geolocation.watchPosition(
              (position) => {
                const location = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                setCurrentLocation(location);
                sendLocation(location);
              },
              () => {
                Toast.show({
                  type: "error",
                  message: "위치 정보를 가져오지 못했어요.",
                  duration: 2500,
                });
              },
              {
                enableHighAccuracy: true,
                maximumAge: 3000,
                timeout: 10000,
              }
            );
          }
          continue;
        }

        if (command !== "MESSAGE") continue;
        const destination = headers.get("destination");
        if (destination !== `/sub/sessions/${currentSessionId}/location`) continue;

        try {
          const parsed = JSON.parse(body) as unknown;
          const eventMessage = normalizeIncomingSessionMessage(parsed, currentSessionId);
          if (!eventMessage) continue;
          handleSessionEventMessage(eventMessage, myUserId);
        } catch {
          // Ignore malformed payload.
        }
      }
    };

    socket.onerror = () => {
      Toast.show({
        type: "error",
        message: "위치 공유 연결에 실패했어요.",
        duration: 3000,
      });
    };

    socket.onclose = () => {
      isSessionStompConnectedRef.current = false;
    };
  }, [currentLocation, sessionId, setCurrentLocation, stopSessionLocationSharing, transitionPhase]);

  useEffect(() => {
    if (phase !== "moving") return;
    if (!sessionId) return;
    if (partnerLocation) return;
    startSessionLocationSharing();
  }, [partnerLocation, phase, sessionId, startSessionLocationSharing]);

  useEffect(() => {
    if (isManualLocationPhase) {
      manualModeOverrideRef.current = false;
      setIsManualLocationMode(true);
      return;
    }
    if (manualModeOverrideRef.current) return;
    setIsManualLocationMode(false);
  }, [isManualLocationPhase, setIsManualLocationMode]);

  useEffect(() => {
    if (phase !== "requesting-companion" && manualModeOverrideRef.current) {
      manualModeOverrideRef.current = false;
      setIsManualLocationMode(false);
    }
  }, [phase, setIsManualLocationMode]);

  useEffect(() => {
    if (persistedFlowPhase === "requesting-companion" && persistedFlowWasManualMode) {
      manualModeOverrideRef.current = true;
      setIsManualLocationMode(true);
    }
  }, [persistedFlowPhase, persistedFlowWasManualMode, setIsManualLocationMode]);

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
    if (currentLocation) {
      lookupAddress(currentLocation);
      return;
    }
    const center = mapRef.current?.getCenter();
    if (!center) return;
    const nextLocation = { lat: center.getLat(), lng: center.getLng() };
    setCurrentLocation(nextLocation);
    lookupAddress(nextLocation);
  }, [
    currentLocation,
    isCurrentLocationSheetOpen,
    isManualLocationMode,
    lookupAddress,
    mapRef,
    setCurrentLocation,
  ]);

  useEffect(() => {
    if (!isCurrentLocationSheetOpen || !currentLocation) return;
    panMapToLocation(currentLocation);
  }, [isCurrentLocationSheetOpen, currentLocation, panMapToLocation]);

  useEffect(() => {
    if (
      !isCurrentLocationSheetOpen ||
      isManualLocationMode ||
      !currentLocation ||
      !isKakaoReady ||
      isResolvingAddress ||
      addressInfo
    ) {
      return;
    }

    lookupAddress(currentLocation);
  }, [
    addressInfo,
    currentLocation,
    isCurrentLocationSheetOpen,
    isKakaoReady,
    isManualLocationMode,
    isResolvingAddress,
    lookupAddress,
  ]);

  useEffect(() => {
    savePersistedMatchFlow({
      phase,
      matchProposal,
      sessionId,
      expiredMatchRequest,
      isMatchExpiredModalOpen,
      wasManualLocationMode: requestingManualMode,
      updatedAt: Date.now(),
    });
  }, [
    expiredMatchRequest,
    isMatchExpiredModalOpen,
    matchProposal,
    phase,
    requestingManualMode,
    sessionId,
  ]);

  useEffect(() => {
    const shouldReconnect = phase === "matching-in-progress" || phase === "match-success";
    if (!shouldReconnect) return;
    if (sseConnectionRef.current) return;

    logger.info("[match-sse] reconnect from persisted state", { phase });
    openMatchSseConnection();
  }, [openMatchSseConnection, phase]);

  useEffect(() => {
    matchRetryCountRef.current = matchRetryCount;
  }, [matchRetryCount]);

  useEffect(() => {
    if (phase !== "match-failed") return;
    if (isMatchExpiredModalOpen) return;
    if (isMatchRetryLimitModalOpen) return;
    transitionPhase("idle");
  }, [isMatchExpiredModalOpen, isMatchRetryLimitModalOpen, phase, transitionPhase]);

  useEffect(() => {
    if (phase !== "idle") return;
    if (!partnerLocation && !meetingLocation) return;
    stopSessionLocationSharing();
    setPartnerLocation(null);
    setMeetingLocation(null);
  }, [meetingLocation, partnerLocation, phase, stopSessionLocationSharing]);

  useEffect(() => {
    return () => {
      sseConnectionRef.current?.close();
      sseConnectionRef.current = null;
      stopSessionLocationSharing();
    };
  }, [stopSessionLocationSharing]);

  const handleCancelMatchingRequest = useCallback(async () => {
    if (isCancellingMatchRequest) return;

    setIsCancellingMatchRequest(true);
    try {
      await cancelMatchRequest();
      logger.info("[match-request] cancelled");
      pendingProposalRejectedRef.current = false;
      sseConnectionRef.current?.close();
      sseConnectionRef.current = null;
      stopSessionLocationSharing();
      setMatchProposal(null);
      setMatchSession(null);
      setSessionId(null);
      setPartnerLocation(null);
      setMeetingLocation(null);
      setNearbyWaitingCount(null);
      setExpiredMatchRequest(null);
      setIsMatchExpiredModalOpen(false);
      setIsMatchRetryLimitModalOpen(false);
      setMatchRetryCount(0);
      matchRetryCountRef.current = 0;
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
  }, [cancelMatchRequest, isCancellingMatchRequest, stopSessionLocationSharing, transitionPhase]);

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
    setRequestingManualMode(isManualLocationMode);
    companionRequestForm.reset({
      expectedDuration: null,
      requestMessage: "",
    });
    currentLocationSheet.close();
    companionRequestSheet.open();
    transitionPhase("requesting-companion");
  }, [
    companionRequestForm,
    companionRequestSheet,
    currentLocationSheet,
    transitionPhase,
    isManualLocationMode,
  ]);

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

  const handleCompleteArrival = useCallback(async () => {
    if (!sessionId) return;

    try {
      await arriveMatchSession(sessionId);
      setArrivalStatusModalType(isPartnerArrived ? "partner-arrived" : "partner-moving");
    } catch (error) {
      const apiMessage = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      logger.error(error, { tag: "match-session-arrive", sessionId });
      Toast.show({
        type: "error",
        message: apiMessage || "도착 완료 처리에 실패했어요.",
        duration: 3000,
      });
    }
  }, [arriveMatchSession, isPartnerArrived, sessionId]);

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
        setSessionId(null);
        stopSessionLocationSharing();
        setPartnerLocation(null);
        setMeetingLocation(null);
        pendingProposalRejectedRef.current = false;
        setNearbyWaitingCount(null);
        setExpiredMatchRequest(null);
        setIsMatchExpiredModalOpen(false);
        setIsMatchRetryLimitModalOpen(false);
        setMatchRetryCount(0);
        matchRetryCountRef.current = 0;
        openMatchSseConnection();
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
        setSessionId(null);
        stopSessionLocationSharing();
        setPartnerLocation(null);
        setMeetingLocation(null);
        pendingProposalRejectedRef.current = false;
        setNearbyWaitingCount(null);
        setExpiredMatchRequest(null);
        setIsMatchExpiredModalOpen(false);
        setIsMatchRetryLimitModalOpen(false);
        setMatchRetryCount(0);
        matchRetryCountRef.current = 0;

        Toast.show({
          type: "error",
          message: apiMessage || "매칭 요청에 실패했어요. 다시 시도해주세요.",
          duration: 3000,
        });
      });
  });

  const handleAcceptMatchFound = useCallback(() => {
    const proposalId = matchProposal?.id;
    if (proposalId) {
      void acceptMatchProposal(proposalId).catch((error: unknown) => {
        const apiMessage = axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message
          : undefined;
        logger.error(error, { tag: "match-proposal-accept", proposalId });
        Toast.show({
          type: "error",
          message: apiMessage || "매칭 수락 처리에 실패했어요.",
          duration: 3000,
        });
      });
    } else {
      logger.warn("[match-request] missing proposal id for accept");
    }

    transitionPhase("match-accepted");
  }, [acceptMatchProposal, matchProposal?.id, transitionPhase]);

  const handleRejectProposal = useCallback(() => {
    const proposalId = matchProposal?.id;
    if (proposalId) {
      void rejectMatchProposal(proposalId)
        .then((response) => {
          logger.info("[match-request] proposal rejected", {
            proposalId,
            code: response.code,
            message: response.message,
          });
        })
        .catch((error: unknown) => {
          const apiMessage = axios.isAxiosError<{ message?: string }>(error)
            ? error.response?.data?.message
            : undefined;
          logger.error(error, { tag: "match-proposal-reject", proposalId });
          Toast.show({
            type: "error",
            message: apiMessage || "매칭 거절 처리에 실패했어요.",
            duration: 3000,
          });
        });
    } else {
      logger.warn("[match-request] missing proposal id for reject");
    }
  }, [matchProposal?.id, rejectMatchProposal]);

  const handleRejectMatchFound = useCallback(() => {
    logger.info("[match-request] continue waiting after reject confirmation");
    setMatchProposal(null);
    setMatchSession(null);
    setSessionId(null);
    transitionPhase("matching-in-progress");
  }, [transitionPhase]);

  const handleCancelMatchFoundAndBackToIdle = useCallback(() => {
    void handleCancelMatchingRequest();
  }, [handleCancelMatchingRequest]);

  const handleCloseMatchExpiredModal = useCallback(() => {
    setIsMatchExpiredModalOpen(false);
    setExpiredMatchRequest(null);
    setIsMatchRetryLimitModalOpen(false);
    setMatchRetryCount(0);
    transitionPhase("idle");
  }, [transitionPhase]);

  const handleRetryMatchExpired = useCallback(async () => {
    if (isRetryingMatchRequest) return;
    const currentRetryCount = matchRetryCountRef.current;
    if (currentRetryCount >= MAX_MATCH_RETRY_COUNT) {
      setIsMatchExpiredModalOpen(false);
      setIsMatchRetryLimitModalOpen(true);
      return;
    }

    const matchRequestId = expiredMatchRequest?.matchRequestId;
    if (!matchRequestId) return;

    setIsRetryingMatchRequest(true);
    try {
      logger.info("[match-request] retry requested", {
        matchRequestId,
        nextRetryCount: currentRetryCount + 1,
      });
      const response = await retryMatchRequest(matchRequestId);

      setMatchProposal(null);
      setMatchSession(null);
      setSessionId(null);
      setExpiredMatchRequest(null);
      setIsMatchExpiredModalOpen(false);
      setNearbyWaitingCount(response.data?.nearbyWaitingCount ?? null);
      const nextRetryCount = currentRetryCount + 1;
      matchRetryCountRef.current = nextRetryCount;
      setMatchRetryCount(nextRetryCount);
      setIsMatchRetryLimitModalOpen(false);

      sseConnectionRef.current?.close();
      sseConnectionRef.current = null;
      openMatchSseConnection();
      transitionPhase("matching-in-progress");
      logger.info("[match-request] retry success", {
        matchRequestId: response.data?.matchRequestId,
        status: response.data?.status,
      });
    } catch (error) {
      const apiMessage = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      logger.error(error, { tag: "match-request-retry" });
      setIsMatchExpiredModalOpen(true);
      Toast.show({
        type: "error",
        message: apiMessage || "재시도에 실패했어요. 잠시 후 다시 시도해 주세요.",
        duration: 3000,
      });
    } finally {
      setIsRetryingMatchRequest(false);
    }
  }, [
    expiredMatchRequest?.matchRequestId,
    isRetryingMatchRequest,
    openMatchSseConnection,
    retryMatchRequest,
    transitionPhase,
  ]);

  const handleCloseMatchRetryLimitModal = useCallback(() => {
    setIsMatchRetryLimitModalOpen(false);
    setIsMatchExpiredModalOpen(false);
    setExpiredMatchRequest(null);
    setMatchRetryCount(0);
    matchRetryCountRef.current = 0;
    transitionPhase("idle");
  }, [transitionPhase]);

  const handleReserveMatchRetry = useCallback(() => {
    logger.info("[match-request] reserve flow requested from retry-limit modal");
  }, []);

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
    partnerLocation,
    meetingLocation,
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
      nearbyWaitingCount,
      cancel: () => {
        void handleCancelMatchingRequest();
      },
    },
    matchFoundSheet: {
      isOpen: phase === "match-success",
      accept: handleAcceptMatchFound,
      rejectProposal: handleRejectProposal,
      reject: handleRejectMatchFound,
      cancelAndBackToIdle: handleCancelMatchFoundAndBackToIdle,
      close: () => transitionPhase("idle"),
    },
    acceptedMatchDetailSheet: {
      isOpen: phase === "match-accepted" || phase === "moving",
      hasMatchSession: Boolean(sessionId),
      isMoving: phase === "moving",
      isCompletingArrival: isArrivingMatchSession,
      proposalRejectedSignal,
      partnerProfileText,
      partnerExpectedDurationLabel,
      partnerRequestMessage,
      startMoving: startSessionLocationSharing,
      completeArrival: () => {
        void handleCompleteArrival();
      },
      arrivalStatusModal: {
        isOpen: arrivalStatusModalType != null,
        type: arrivalStatusModalType ?? "partner-moving",
        title:
          arrivalStatusModalType === "partner-arrived"
            ? "상대방이 도착했어요"
            : "상대가 이동 중이에요",
        content:
          arrivalStatusModalType === "partner-arrived"
            ? "서로 만났다면 ‘만남 시작하기'를 눌러주세요\n시작해야 만남이 공식적으로 기록돼요"
            : "메이트가 약속 장소에 도착하면\n알림을 보내드릴게요",
        close: () => setArrivalStatusModalType(null),
      },
      close: () => transitionPhase("idle"),
    },
    matchExpiredModal: {
      isOpen: isMatchExpiredModalOpen,
      expiresAt: expiredMatchRequest?.expiresAt ?? null,
      retry: handleRetryMatchExpired,
      pause: handleCloseMatchExpiredModal,
      close: handleCloseMatchExpiredModal,
    },
    matchRetryLimitModal: {
      isOpen: isMatchRetryLimitModalOpen,
      reserve: handleReserveMatchRetry,
      close: handleCloseMatchRetryLimitModal,
      nextTime: handleCloseMatchRetryLimitModal,
    },
    onBottomSheetSnapChange: handleBottomSheetSnapChange,
    expandableFabActions: {
      findCompanion: handleFindCompanion,
      openManualLocationSetting: handleOpenManualLocationSetting,
      resolveLocation: handleResolveLocationWithPhase,
    },
  };
}
