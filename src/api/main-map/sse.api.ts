import { getAccessToken, refreshAccessToken } from "@/api/client";
import { logger } from "@/lib/shared/logger";

type MatchProposalEventData = {
  id: number;
  userAId: number;
  userBId: number;
  status: string;
  userADecision: string;
  userBDecision: string;
};

type MatchSessionEventData = {
  id: number;
  userAId: number;
  userBId: number;
};

export type SseConnection = {
  close: () => void;
};

type ConnectMatchSseOptions = {
  onOpen?: () => void;
  onError?: (error: unknown) => void;
  onMatchProposal?: (data: MatchProposalEventData) => void;
  onMatchSession?: (data: MatchSessionEventData) => void;
};

function toSseUrl(): string {
  const endpoint = "/api/sse";
  const isMockMode = import.meta.env.VITE_MSW_ENABLED === "true";
  if (isMockMode) {
    return endpoint;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!baseUrl) {
    return endpoint;
  }

  return new URL(endpoint, baseUrl).toString();
}

function parseSseChunk(
  chunk: string,
  handlers: Pick<ConnectMatchSseOptions, "onMatchProposal" | "onMatchSession">
) {
  const blocks = chunk.split("\n\n");

  for (const block of blocks) {
    if (!block.trim()) continue;

    let eventName = "";
    const dataLines: string[] = [];
    const lines = block.split("\n");

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      if (!line || line.startsWith(":")) continue;

      if (line.startsWith("event:")) {
        eventName = line.slice("event:".length).trim();
        continue;
      }

      if (line.startsWith("data:")) {
        dataLines.push(line.slice("data:".length).trim());
      }
    }

    if (!eventName || dataLines.length === 0) continue;
    const dataText = dataLines.join("\n");

    try {
      const parsed = JSON.parse(dataText) as unknown;
      if (eventName === "match.proposal") {
        handlers.onMatchProposal?.(parsed as MatchProposalEventData);
      } else if (eventName === "match.session") {
        handlers.onMatchSession?.(parsed as MatchSessionEventData);
      }
    } catch {
      // Ignore malformed event payload.
    }
  }
}

async function openSseResponse(signal: AbortSignal): Promise<Response> {
  const token = getAccessToken();
  if (!token) {
    logger.warn("[match-sse] missing access token");
    throw new Error("Missing access token.");
  }

  logger.info("[match-sse] request start", { url: toSseUrl() });

  const request = () =>
    fetch(toSseUrl(), {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-cache",
      signal,
    });

  let response = await request();
  logger.info("[match-sse] first response", { status: response.status });

  if (response.status === 401) {
    logger.warn("[match-sse] unauthorized, trying refresh");
    const nextAccessToken = await refreshAccessToken();
    response = await fetch(toSseUrl(), {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${nextAccessToken}`,
      },
      cache: "no-cache",
      signal,
    });
    logger.info("[match-sse] retry response", { status: response.status });
  }

  return response;
}

export function connectMatchSseApi(options: ConnectMatchSseOptions): SseConnection {
  const controller = new AbortController();
  let isClosed = false;
  logger.info("[match-sse] connect invoked");

  const close = () => {
    if (isClosed) return;
    isClosed = true;
    controller.abort();
    logger.info("[match-sse] connection closed");
  };

  void (async () => {
    try {
      const response = await openSseResponse(controller.signal);
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`SSE request failed (${response.status}): ${body.slice(0, 200)}`);
      }

      const contentType = response.headers.get("content-type") ?? "";
      logger.info("[match-sse] stream opened", {
        status: response.status,
        contentType,
      });
      if (!contentType.includes("text/event-stream")) {
        const body = await response.text().catch(() => "");
        throw new Error(`Invalid SSE content-type (${contentType}): ${body.slice(0, 200)}`);
      }

      options.onOpen?.();

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("SSE response body is empty.");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (!isClosed) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const boundary = buffer.lastIndexOf("\n\n");
        if (boundary === -1) continue;

        const ready = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        logger.debug("[match-sse] chunk parsed");
        parseSseChunk(ready, {
          onMatchProposal: options.onMatchProposal,
          onMatchSession: options.onMatchSession,
        });
      }
      logger.warn("[match-sse] stream ended by server");
    } catch (error) {
      if (isClosed) return;
      logger.error(error, { tag: "match-sse-connect" });
      options.onError?.(error);
    }
  })();

  return { close };
}
