type SessionSocketMessageType = "LOCATION" | "USER_ARRIVED" | "SESSION_READY" | "SESSION_END";

type SessionSocketMessage = {
  type: SessionSocketMessageType;
  sessionId: number;
  senderId: number | null;
  timestamp: string;
  data: Record<string, unknown>;
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

const SOCKET_CONNECTING = 0;
const SOCKET_OPEN = 1;
const SOCKET_CLOSED = 3;
const MOCK_PARTNER_ID = 999999;

function toStompFrame(command: string, headers: Record<string, string>, body = "") {
  const headerText = Object.entries(headers)
    .map(([key, value]) => `${key}:${value}`)
    .join("\n");
  return `${command}\n${headerText}\n\n${body}\0`;
}

function parseClientFrame(raw: string) {
  const normalized = raw.replace(/\0/g, "");
  const [headerPart, body = ""] = normalized.split("\n\n");
  const headerLines = headerPart.split("\n");
  const command = headerLines[0]?.trim();
  const headers = new Map<string, string>();

  for (const line of headerLines.slice(1)) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;
    headers.set(line.slice(0, separatorIndex).trim(), line.slice(separatorIndex + 1).trim());
  }

  return { command, headers, body };
}

export function createMockSessionSocket(
  sessionId: number,
  scenario?: "disconnect" | null
): StompCompatibleSocket {
  let intervalId: number | null = null;
  let disconnectTimeoutId: number | null = null;
  let tick = 0;
  let subscribedDestination: string | null = null;
  let isConnected = false;
  let myLocation: { latitude: number; longitude: number } | null = null;

  const socket: StompCompatibleSocket = {
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
    readyState: SOCKET_CONNECTING,
    close() {
      if (intervalId != null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
      if (disconnectTimeoutId != null) {
        window.clearTimeout(disconnectTimeoutId);
        disconnectTimeoutId = null;
      }
      socket.readyState = SOCKET_CLOSED;
      socket.onclose?.(new CloseEvent("close"));
    },
    send(data: string) {
      if (socket.readyState !== SOCKET_OPEN) return;

      const { command, headers, body } = parseClientFrame(data);
      if (!command) return;

      if (command === "CONNECT") {
        isConnected = true;
        const connectedFrame = toStompFrame("CONNECTED", { version: "1.2" });
        socket.onmessage?.(new MessageEvent("message", { data: connectedFrame }));
        return;
      }

      if (!isConnected) return;

      if (command === "SUBSCRIBE") {
        subscribedDestination = headers.get("destination") ?? null;
        if (!subscribedDestination) return;
        if (scenario === "disconnect") {
          disconnectTimeoutId = window.setTimeout(() => {
            socket.close();
          }, 3000);
        }

        intervalId = window.setInterval(() => {
          tick += 1;
          const wobble = (tick % 2 === 0 ? 1 : -1) * 0.00007;

          const emit = (payload: SessionSocketMessage) => {
            if (!subscribedDestination) return;
            const messageFrame = toStompFrame(
              "MESSAGE",
              { destination: subscribedDestination },
              JSON.stringify(payload)
            );
            socket.onmessage?.(new MessageEvent("message", { data: messageFrame }));
          };

          emit({
            type: "LOCATION",
            sessionId,
            senderId: MOCK_PARTNER_ID,
            timestamp: new Date().toISOString(),
            data: {
              latitude: (myLocation?.latitude ?? 37.56655) + 0.00035 + wobble,
              longitude: (myLocation?.longitude ?? 126.97765) - 0.00035 - wobble,
            },
          });

          if (tick === 5) {
            emit({
              type: "USER_ARRIVED",
              sessionId,
              senderId: MOCK_PARTNER_ID,
              timestamp: new Date().toISOString(),
              data: { isArrived: true },
            });
          }

          if (tick === 6) {
            emit({
              type: "SESSION_READY",
              sessionId,
              senderId: null,
              timestamp: new Date().toISOString(),
              data: { status: "ARRIVED" },
            });
          }

          if (tick === 10) {
            emit({
              type: "SESSION_END",
              sessionId,
              senderId: MOCK_PARTNER_ID,
              timestamp: new Date().toISOString(),
              data: { status: "ENDED" },
            });
            socket.close();
          }
        }, 3000);
        return;
      }

      if (command === "SEND") {
        try {
          const payload = JSON.parse(body || "{}") as {
            latitude?: number;
            longitude?: number;
            data?: { latitude?: number; longitude?: number };
          };
          const latitude = Number(payload.data?.latitude ?? payload.latitude);
          const longitude = Number(payload.data?.longitude ?? payload.longitude);
          if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            myLocation = { latitude, longitude };
          }
        } catch {
          // Ignore malformed payload.
        }
      }
    },
  };

  window.setTimeout(() => {
    if (socket.readyState !== SOCKET_CONNECTING) return;
    socket.readyState = SOCKET_OPEN;
    socket.onopen?.(new Event("open"));
  }, 0);

  return socket;
}
