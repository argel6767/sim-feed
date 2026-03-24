import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import { createStompClient } from "~/configs/stompConfig";
import { useAuthToken } from "~/contexts/auth-token-context";

export type ChatNotification = {
  type: string;
  userId: string;
  chatId: number;
  message: string;
  timestamp: string;
};

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export function useChatWebSocket(chatId: number | null) {
  const { token, isReady, refreshToken } = useAuthToken();
  const clientRef = useRef<Client | null>(null);
  const refreshTokenRef = useRef(refreshToken);
  refreshTokenRef.current = refreshToken;

  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);

  useEffect(() => {
    if (!isReady || !token || chatId === null) {
      return;
    }

    const client = createStompClient(token);
    clientRef.current = client;
    setStatus("connecting");
    setNotifications([]);

    client.beforeConnect = async () => {
      const freshToken = await refreshTokenRef.current();
      if (freshToken) {
        client.connectHeaders = {
          Authorization: `Bearer ${freshToken}`,
        };
      }
    };

    client.onConnect = () => {
      setStatus("connected");

      client.subscribe(`/topic/chats/${chatId}`, (frame) => {
        try {
          const notification: ChatNotification = JSON.parse(frame.body);
          setNotifications((prev) => [...prev, notification]);
        } catch (err) {
          console.error("[useChatWebSocket] Failed to parse message:", err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error(
        "[useChatWebSocket] STOMP error:",
        frame.headers["message"],
        frame.body
      );
      setStatus("error");
    };

    client.onWebSocketError = (event) => {
      console.error("[useChatWebSocket] WebSocket error:", event);
      setStatus("error");
    };

    client.onWebSocketClose = () => {
      if (clientRef.current === client) {
        setStatus("disconnected");
      }
    };

    client.activate();

    return () => {
      client.deactivate();
      if (clientRef.current === client) {
        clientRef.current = null;
        setStatus("disconnected");
      }
    };
  }, [isReady, token, chatId]);

  const joinChat = useCallback(() => {
    const client = clientRef.current;
    if (!client?.connected) {
      console.warn(
        "[useChatWebSocket] Cannot join chat: STOMP client is not connected"
      );
      return;
    }
    client.publish({
      destination: `/app/chats/${chatId}/join`,
    });
  }, [chatId]);

  const publish = useCallback(
    (destination: string, body?: string) => {
      const client = clientRef.current;
      if (!client?.connected) {
        console.warn(
          "[useChatWebSocket] Cannot publish: STOMP client is not connected"
        );
        return;
      }
      client.publish({ destination, body });
    },
    []
  );

  const disconnect = useCallback(() => {
    clientRef.current?.deactivate();
    clientRef.current = null;
    setStatus("disconnected");
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  return {
    status,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
    notifications,
    joinChat,
    publish,
    disconnect,
    clearNotifications,
  } as const;
}
