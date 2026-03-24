import { useChatWebSocket } from "~/hooks/useChatWebSocket";

export function ChatRoom({ chatId }: { chatId: number }) {
  const {
    isConnected,
    isConnecting,
    notifications,
    joinChat,
  } = useChatWebSocket(chatId);

  return (
    <div>
      {isConnecting && <p>Connecting…</p>}
      {isConnected && (
        <>
          <button onClick={joinChat}>Announce Presence</button>
          <ul>
            {notifications.map((n, i) => (
              <li key={i}>
                [{n.type}] {n.message}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
