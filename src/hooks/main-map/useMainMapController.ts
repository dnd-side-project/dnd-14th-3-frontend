import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { z } from "zod";

import axios from "axios";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Client,
  type IFrame,
  type IMessage,
  type IStompSocket,
  type StompSubscription,
} from "@stomp/stompjs";
import { useForm, useWatch } from "react-hook-form";
import SockJS from "sockjs-client";

import {
  type MatchProposalEventData,
  type MatchRequestExpiredEventData,
  type MatchRequestWaitingCountEventData,
  type MatchSessionEventData,
  type SseConnection,
} from "@/types/main-map";
import { type LatLng } from "@/types/main-map/location.type";
import { type MapPhase } from "@/types/main-map/map-phase.type";
import { type MatchExpectedDuration } from "@/types/main-map/match-request.type";

import { logger } from "@/lib/shared/logger";

import { getAccessToken } from "@/api/client";
import { connectMatchSseApi } from "@/api/main-map/sse.api";

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
  useStartMeetingMatchSession,
} from "@/queries/match";

import { createMockSessionSocket } from "@/mocks/ws/sessionSocket.mock";

const companionRequestSchema = z.object({
  expectedDuration: z.enum(["TEN_MINUTES", "TWENTY_MINUTES", "THIRTY_PLUS_MINUTES"]).nullable(),
  requestMessage: z.string().max(200, "Request message must be 200 characters or fewer."),
});

type CompanionRequestFormValues = z.infer<typeof companionRequestSchema>;

const MATCH_FLOW_STORAGE_KEY = "main-map-match-flow-v1";
const MATCH_FLOW_TTL_MS = 30 * 60 * 1000;
const MAX_MATCH_RETRY_COUNT = 2;
const SSE_RECONNECT_BASE_DELAY_MS = 1000;
const SSE_RECONNECT_MAX_DELAY_MS = 30000;
const SSE_RECONNECT_MAX_ATTEMPTS = 8;
const SSE_RECONNECT_STABLE_WINDOW_MS = 10000;
const WS_RECONNECT_BASE_DELAY_MS = 1000;
const WS_RECONNECT_MAX_DELAY_MS = 30000;
const WS_RECONNECT_MAX_ATTEMPTS = 8;
const WS_RECONNECT_STABLE_WINDOW_MS = 10000;
const SSE_LAST_EVENT_ID_KEY = "match-sse-last-event-id";

function loadLastSseEventId(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(SSE_LAST_EVENT_ID_KEY);
}

function persistLastSseEventId(id: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SSE_LAST_EVENT_ID_KEY, id);
}

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

function getExponentialBackoffDelay(attempt: number, baseDelayMs: number, maxDelayMs: number) {
  const safeAttempt = Math.max(1, attempt);
  return Math.min(maxDelayMs, baseDelayMs * 2 ** (safeAttempt - 1));
}

function shouldReconnectSseInPhase(phase: MapPhase) {
  return (
    phase === "matching-in-progress" ||
    phase === "match-success" ||
    phase === "match-accepted" ||
    phase === "moving" ||
    phase === "arrival-pending"
  );
}

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
  if (duration === "THIRTY_PLUS_MINUTES") return "30분 이상";
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
  arrivalStatusModalType: "partner-arrived" | "partner-moving" | null;
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
      arrivalStatusModalType:
        parsed.arrivalStatusModalType === "partner-arrived" ||
        parsed.arrivalStatusModalType === "partner-moving"
          ? parsed.arrivalStatusModalType
          : null,
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
  const restorablePhase = persistedFlowPhase === "meeting-started" ? "idle" : persistedFlowPhase;
  const initialPhase =
    restorablePhase === "requesting-companion"
      ? persistedFlowWasManualMode
        ? "manual-location-setting"
        : "location-setting"
      : (restorablePhase ?? "idle");
  const navigate = useNavigate();
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
  const [isWsConnectionDegraded, setIsWsConnectionDegraded] = useState(false);
  const [isMeetingStartedModalOpen, setIsMeetingStartedModalOpen] = useState(false);
  const [arrivalStatusModalType, setArrivalStatusModalType] = useState<
    "partner-arrived" | "partner-moving" | null
  >(persistedMatchFlow?.arrivalStatusModalType ?? null);
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
  const lastSseEventIdRef = useRef<string | null>(loadLastSseEventId());
  const sseReconnectTimerRef = useRef<number | null>(null);
  const sseReconnectAttemptRef = useRef(0);
  const sseConnectedAtRef = useRef<number | null>(null);
  const shouldReconnectSseRef = useRef(false);
  const sessionWsRef = useRef<Client | null>(null);
  const sessionWsSubscriptionRef = useRef<StompSubscription | null>(null);
  const wsReconnectTimerRef = useRef<number | null>(null);
  const wsReconnectAttemptRef = useRef(0);
  const wsConnectedAtRef = useRef<number | null>(null);
  const shouldReconnectWsRef = useRef(false);
  const sessionWatchIdRef = useRef<number | null>(null);
  const isSessionStompConnectedRef = useRef(false);
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
  const { mutateAsync: startMeetingMatchSession } = useStartMeetingMatchSession();
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
    if (phase === "arrival-pending" || phase === "meeting-started") return;
    setIsPartnerArrived(false);
    setArrivalStatusModalType(null);
  }, [phase, sessionId]);

  useEffect(() => {
    if (
      phase === "match-accepted" ||
      phase === "moving" ||
      phase === "arrival-pending" ||
      phase === "meeting-started"
    ) {
      return;
    }
    setArrivalStatusModalType(null);
  }, [phase]);

  useEffect(() => {
    if (phase !== "arrival-pending") return;
    if (arrivalStatusModalType != null) return;
    setArrivalStatusModalType("partner-moving");
  }, [arrivalStatusModalType, phase]);

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
    const shouldReconnect = shouldReconnectSseInPhase(phase);
    shouldReconnectSseRef.current = shouldReconnect;
    if (shouldReconnect) return;
    sseReconnectAttemptRef.current = 0;
    if (sseReconnectTimerRef.current != null) {
      window.clearTimeout(sseReconnectTimerRef.current);
      sseReconnectTimerRef.current = null;
    }
  }, [phase]);

  useEffect(() => {
    if (
      phase !== "match-success" &&
      phase !== "match-accepted" &&
      phase !== "moving" &&
      phase !== "arrival-pending" &&
      phase !== "meeting-started"
    ) {
      return;
    }
    if (!pendingProposalRejectedRef.current) return;
    pendingProposalRejectedRef.current = false;
    setProposalRejectedSignal((prev) => prev + 1);
  }, [phase]);

  const openMatchSseConnection = useCallback(() => {
    shouldReconnectSseRef.current = true;
    if (sseReconnectTimerRef.current != null) {
      window.clearTimeout(sseReconnectTimerRef.current);
      sseReconnectTimerRef.current = null;
    }
      sseConnectionRef.current?.close();
      sseConnectionRef.current = connectMatchSseApi({
        lastEventId: lastSseEventIdRef.current,
        onEventId: (id) => {
          lastSseEventIdRef.current = id;
          persistLastSseEventId(id);
        },
        onOpen: () => {
          sseConnectedAtRef.current = Date.now();
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
          phaseRef.current === "moving" ||
          phaseRef.current === "arrival-pending" ||
          phaseRef.current === "meeting-started"
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
        sseConnectionRef.current = null;
        const connectedAt = sseConnectedAtRef.current;
        if (connectedAt != null && Date.now() - connectedAt >= SSE_RECONNECT_STABLE_WINDOW_MS) {
          sseReconnectAttemptRef.current = 0;
        }
        sseConnectedAtRef.current = null;

        if (!shouldReconnectSseRef.current || !shouldReconnectSseInPhase(phaseRef.current)) return;
        if (sseReconnectTimerRef.current != null) return;

        const nextAttempt = sseReconnectAttemptRef.current + 1;
        if (nextAttempt > SSE_RECONNECT_MAX_ATTEMPTS) {
          shouldReconnectSseRef.current = false;
          sseReconnectAttemptRef.current = 0;
          transitionPhase("match-failed");
          Toast.show({
            type: "error",
            message: "실시간 매칭 연결이 끊겼어요. 다시 시도해주세요.",
            duration: 3000,
          });
          return;
        }

        sseReconnectAttemptRef.current = nextAttempt;
        const delayMs = getExponentialBackoffDelay(
          nextAttempt,
          SSE_RECONNECT_BASE_DELAY_MS,
          SSE_RECONNECT_MAX_DELAY_MS
        );
        logger.warn("[match-sse] reconnect scheduled", {
          attempt: nextAttempt,
          delayMs,
        });
        sseReconnectTimerRef.current = window.setTimeout(() => {
          sseReconnectTimerRef.current = null;
          if (!shouldReconnectSseRef.current || !shouldReconnectSseInPhase(phaseRef.current)) return;
          openMatchSseConnection();
        }, delayMs);
      },
    });
  }, [transitionPhase]);

  const stopSessionLocationSharing = useCallback((resetReconnectState = true) => {
    const stompClient = sessionWsRef.current;
    sessionWsRef.current = null;
    sessionWsSubscriptionRef.current?.unsubscribe();
    sessionWsSubscriptionRef.current = null;

    if (resetReconnectState) {
      shouldReconnectWsRef.current = false;
      wsReconnectAttemptRef.current = 0;
      wsConnectedAtRef.current = null;
      if (wsReconnectTimerRef.current != null) {
        window.clearTimeout(wsReconnectTimerRef.current);
        wsReconnectTimerRef.current = null;
      }
    }
    if (
      sessionWatchIdRef.current != null &&
      typeof navigator !== "undefined" &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(sessionWatchIdRef.current);
      sessionWatchIdRef.current = null;
    }
    stompClient?.deactivate();
    isSessionStompConnectedRef.current = false;
    if (resetReconnectState) {
      setIsWsConnectionDegraded(false);
    }
  }, []);

  useEffect(() => {
    if (!isMeetingStartedModalOpen) return;
    const timeoutId = window.setTimeout(() => {
      setIsMeetingStartedModalOpen(false);
      setArrivalStatusModalType(null);
      stopSessionLocationSharing();
      clearPersistedSessionLocations();
      setMatchSession(null);
      setSessionId(null);
      setPartnerLocation(null);
      setMeetingLocation(null);
      setIsPartnerArrived(false);
      transitionPhase("idle");
    }, 6000);

    return () => window.clearTimeout(timeoutId);
  }, [
    clearPersistedSessionLocations,
    isMeetingStartedModalOpen,
    stopSessionLocationSharing,
    transitionPhase,
  ]);

  useEffect(() => {
    const shouldValidateSession =
      phase === "match-accepted" ||
      phase === "moving" ||
      phase === "arrival-pending" ||
      phase === "meeting-started";
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
    const currentPhase = phaseRef.current;
    const hasActiveSessionTransport =
      sessionWsRef.current != null ||
      sessionWatchIdRef.current != null ||
      isSessionStompConnectedRef.current;
    if (hasActiveSessionTransport) return;

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
        clearPersistedSessionLocations();
        setSessionId(null);
        setPartnerLocation(null);
        setMeetingLocation(null);
        setIsPartnerArrived(false);
        setArrivalStatusModalType(null);
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

    stopSessionLocationSharing(false);
    shouldReconnectWsRef.current = true;
    setIsWsConnectionDegraded(false);
    if (wsReconnectTimerRef.current != null) {
      window.clearTimeout(wsReconnectTimerRef.current);
      wsReconnectTimerRef.current = null;
    }
    if (currentPhase !== "arrival-pending") {
      transitionPhase("moving");
    }

    const wsUrl = import.meta.env.VITE_WS_BASE_URL;
    const wsScenario = import.meta.env.VITE_MSW_MATCH_WS_SCENARIO;
    const stompClient = new Client({
      webSocketFactory: () =>
        isMockMode
          ? (createMockSessionSocket(
              currentSessionId,
              wsScenario === "disconnect" ? "disconnect" : null
            ) as unknown as IStompSocket)
          : (new SockJS(toSockJsUrl(wsUrl)) as unknown as IStompSocket),
      connectHeaders: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      reconnectDelay: 0,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });
    sessionWsRef.current = stompClient;

    const sendLocation = (location: LatLng) => {
      if (!isSessionStompConnectedRef.current || !stompClient.connected) return;
      stompClient.publish({
        destination: `/pub/sessions/${currentSessionId}/location`,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          type: "LOCATION",
          sessionId: currentSessionId,
          timestamp: new Date().toISOString(),
          data: {
            latitude: location.lat,
            longitude: location.lng,
          },
          latitude: location.lat,
          longitude: location.lng,
        }),
      });
    };

    stompClient.onConnect = () => {
      if (sessionWsRef.current !== stompClient) return;
      isSessionStompConnectedRef.current = true;
      wsConnectedAtRef.current = Date.now();
      setIsWsConnectionDegraded(false);
      sessionWsSubscriptionRef.current = stompClient.subscribe(
        `/sub/sessions/${currentSessionId}/location`,
        (message: IMessage) => {
          try {
            const parsed = JSON.parse(message.body) as unknown;
            const eventMessage = normalizeIncomingSessionMessage(parsed, currentSessionId);
            if (!eventMessage) return;
            handleSessionEventMessage(eventMessage, myUserId);
          } catch {
            // Ignore malformed payload.
          }
        },
        { id: `session-location-${currentSessionId}` }
      );

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
    };

    stompClient.onStompError = (frame: IFrame) => {
      logger.error("[session-ws] stomp error", {
        message: frame.headers["message"],
        body: frame.body,
      });
    };

    stompClient.onWebSocketError = () => {
      if (sessionWsRef.current !== stompClient) return;
      const currentPhaseForReconnect = phaseRef.current;
      if (
        !shouldReconnectWsRef.current ||
        (currentPhaseForReconnect !== "moving" && currentPhaseForReconnect !== "arrival-pending")
      ) {
        Toast.show({
          type: "error",
          message: "위치 공유 연결에 실패했어요.",
          duration: 3000,
        });
      }
    };

    stompClient.onWebSocketClose = () => {
      if (sessionWsRef.current !== stompClient) return;
      isSessionStompConnectedRef.current = false;
      sessionWsSubscriptionRef.current?.unsubscribe();
      sessionWsSubscriptionRef.current = null;
      sessionWsRef.current = null;
      if (
        sessionWatchIdRef.current != null &&
        typeof navigator !== "undefined" &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(sessionWatchIdRef.current);
        sessionWatchIdRef.current = null;
      }
      const connectedAt = wsConnectedAtRef.current;
      if (connectedAt != null && Date.now() - connectedAt >= WS_RECONNECT_STABLE_WINDOW_MS) {
        wsReconnectAttemptRef.current = 0;
      }
      wsConnectedAtRef.current = null;

      const currentPhaseForReconnect = phaseRef.current;
      if (
        !shouldReconnectWsRef.current ||
        (currentPhaseForReconnect !== "moving" && currentPhaseForReconnect !== "arrival-pending")
      ) {
        return;
      }
      if (wsReconnectTimerRef.current != null) return;

      const nextAttempt = wsReconnectAttemptRef.current + 1;
      if (nextAttempt > WS_RECONNECT_MAX_ATTEMPTS) {
        shouldReconnectWsRef.current = false;
        wsReconnectAttemptRef.current = 0;
        setIsWsConnectionDegraded(true);
        Toast.show({
          type: "error",
          message: "위치 공유가 중단되었어요. 재연결을 눌러 복구해주세요.",
          duration: 3000,
        });
        return;
      }

      wsReconnectAttemptRef.current = nextAttempt;
      const delayMs = getExponentialBackoffDelay(
        nextAttempt,
        WS_RECONNECT_BASE_DELAY_MS,
        WS_RECONNECT_MAX_DELAY_MS
      );
      logger.warn("[session-ws] reconnect scheduled", {
        attempt: nextAttempt,
        delayMs,
      });
      wsReconnectTimerRef.current = window.setTimeout(() => {
        wsReconnectTimerRef.current = null;
        if (!shouldReconnectWsRef.current) return;
        const retryPhase = phaseRef.current;
        if (retryPhase !== "moving" && retryPhase !== "arrival-pending") return;
        startSessionLocationSharing();
      }, delayMs);
    };

    stompClient.activate();
  }, [
    clearPersistedSessionLocations,
    sessionId,
    setCurrentLocation,
    stopSessionLocationSharing,
    transitionPhase,
  ]);

  useEffect(() => {
    if (phase !== "moving" && phase !== "arrival-pending") return;
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
      arrivalStatusModalType,
      wasManualLocationMode: requestingManualMode,
      updatedAt: Date.now(),
    });
  }, [
    arrivalStatusModalType,
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
      shouldReconnectSseRef.current = false;
      sseReconnectAttemptRef.current = 0;
      if (sseReconnectTimerRef.current != null) {
        window.clearTimeout(sseReconnectTimerRef.current);
        sseReconnectTimerRef.current = null;
      }
      sseConnectionRef.current?.close();
      sseConnectionRef.current = null;
      stopSessionLocationSharing();
    };
  }, [stopSessionLocationSharing]);

  const handleRetrySessionLocationSharing = useCallback(() => {
    wsReconnectAttemptRef.current = 0;
    wsConnectedAtRef.current = null;
    shouldReconnectWsRef.current = true;
    if (wsReconnectTimerRef.current != null) {
      window.clearTimeout(wsReconnectTimerRef.current);
      wsReconnectTimerRef.current = null;
    }
    setIsWsConnectionDegraded(false);
    startSessionLocationSharing();
  }, [startSessionLocationSharing]);

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
      transitionPhase("arrival-pending");
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
  }, [arriveMatchSession, isPartnerArrived, sessionId, transitionPhase]);

  const handleOpenKakaoDirections = useCallback(() => {
    if (!currentLocation || !meetingLocation) {
      Toast.show({
        type: "error",
        message: "길찾기 정보를 준비하지 못했어요.",
        duration: 2500,
      });
      return;
    }

    const fromName = encodeURIComponent("현재 위치");
    const toName = encodeURIComponent("약속 장소");
    const directionsUrl = `https://map.kakao.com/link/from/${fromName},${currentLocation.lat},${currentLocation.lng}/to/${toName},${meetingLocation.lat},${meetingLocation.lng}`;
    window.open(directionsUrl, "_blank", "noopener,noreferrer");
  }, [currentLocation, meetingLocation]);

  const handleStartMeeting = useCallback(async () => {
    if (!sessionId) return;

    try {
      await startMeetingMatchSession(sessionId);
      stopSessionLocationSharing();
      setArrivalStatusModalType(null);
      setIsMeetingStartedModalOpen(true);
      transitionPhase("meeting-started");
    } catch (error) {
      const apiMessage = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      logger.error(error, { tag: "match-session-start-meeting", sessionId });
      Toast.show({
        type: "error",
        message: apiMessage || "만남 시작 처리에 실패했어요.",
        duration: 3000,
      });
    }
  }, [sessionId, startMeetingMatchSession, stopSessionLocationSharing, transitionPhase]);

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

  const handleAcceptMatchFound = useCallback(async () => {
    const proposalId = matchProposal?.id;
    if (!proposalId) {
      logger.warn("[match-request] missing proposal id for accept");
      return;
    }

    try {
      await acceptMatchProposal(proposalId);
      transitionPhase("match-accepted");
    } catch (error: unknown) {
      const apiMessage = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      logger.error(error, { tag: "match-proposal-accept", proposalId });
      Toast.show({
        type: "error",
        message: apiMessage || "매칭 수락 처리에 실패했어요.",
        duration: 3000,
      });
    }
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
    handleCloseMatchRetryLimitModal();
    navigate("/companion");
  }, [handleCloseMatchRetryLimitModal, navigate]);

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
      isOpen:
        phase === "match-accepted" ||
        phase === "moving" ||
        phase === "arrival-pending" ||
        phase === "meeting-started",
      hasMatchSession: Boolean(sessionId),
      isMoving: phase === "moving" || phase === "arrival-pending" || phase === "meeting-started",
      isCompletingArrival: isArrivingMatchSession,
      movingSheetTitle: isMeetingStartedModalOpen ? "만남 완료" : "이동 중",
      proposalRejectedSignal,
      isLocationShareDisconnected: isWsConnectionDegraded,
      partnerProfileText,
      partnerExpectedDurationLabel,
      partnerRequestMessage,
      startMoving: startSessionLocationSharing,
      retryLocationShare: handleRetrySessionLocationSharing,
      openDirections: handleOpenKakaoDirections,
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
        confirm: () => {
          void handleStartMeeting();
        },
      },
      meetingStartedModal: {
        isOpen: isMeetingStartedModalOpen,
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
