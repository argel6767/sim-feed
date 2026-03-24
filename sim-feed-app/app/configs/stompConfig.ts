import { Client } from "@stomp/stompjs";

function buildWebSocketUrl(): string {
  const userApiUrl: string = import.meta.env.VITE_USER_API_URL;
  if (!userApiUrl) {
    throw new Error(
      "VITE_USER_API_URL is not defined. Cannot derive WebSocket URL."
    );
  }
  // http://localhost:8080 -> ws://localhost:8080/ws
  // https://api.example.com -> wss://api.example.com/ws
  const wsUrl = userApiUrl.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
  return `${wsUrl}/ws`;
}

export const STOMP_DEFAULTS = {
  brokerURL: buildWebSocketUrl(),
  reconnectDelay: 5000,
  heartbeatIncoming: 10000,
  heartbeatOutgoing: 10000,
} as const;

export function createStompClient(
  token: string,
  overrides: Partial<Omit<typeof STOMP_DEFAULTS, "brokerURL">> & {
    brokerURL?: string;
  } = {}
): Client {
  const config = { ...STOMP_DEFAULTS, ...overrides };

  return new Client({
    brokerURL: config.brokerURL,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: config.reconnectDelay,
    heartbeatIncoming: config.heartbeatIncoming,
    heartbeatOutgoing: config.heartbeatOutgoing,
  });
}
