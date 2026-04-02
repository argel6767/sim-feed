import { useNavigate, useParams } from "react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import { Footer } from "~/components/footer";
import { Nav, MobileGoBackNav, MobileNav } from "~/components/nav";
import { SidebarCard, RightSidebarCard } from "~/components/sidebar";
import { GoBackLink } from "~/components/link";
import { Error } from "~/components/errors";
import { UsernameAvatar, ProfilePictureAvatar } from "~/components/avatars";
import { useChatWebSocket } from "~/hooks/useChatWebSocket";
import { useGetChatMessages } from "~/hooks/useGetChatMessages";
import { useGetUserChats } from "~/hooks/useGetUserChats";
import { useAuthToken } from "~/contexts/auth-token-context";
import { formatDistance } from "date-fns";
import type {
  MessageDto,
  ChatDto,
  ChatMemberDto,
  NewMessageDto,
} from "~/lib/user-api-dtos";
import type { ChatNotification } from "~/hooks/useChatWebSocket";
import { SignedIn, SignedOut, SignInButton } from "@clerk/react-router";
import { useBeforeUnload } from "react-router";

// --- Types ---

type NormalizedMessage = {
  id: string;
  content: string;
  authorId: string;
  authorUsername: string;
  authorImageUrl: string | null;
  authorType: "user" | "persona" | "system";
  createdAt: string;
};

// --- Helpers ---

function getMemberDisplayInfo(member: ChatMemberDto) {
  if (member.user)
    return {
      id: member.user.userId,
      username: member.user.username,
      imageUrl: member.user.imageUrl ?? null,
      type: "user" as const,
    };
  if (member.persona)
    return {
      id: String(member.persona.personaId),
      username: member.persona.username,
      imageUrl: null,
      type: "persona" as const,
    };
  return {
    id: "unknown",
    username: "Unknown",
    imageUrl: null,
    type: "user" as const,
  };
}

function normalizeHistoricalMessage(msg: MessageDto): NormalizedMessage {
  if (msg.userAuthor) {
    return {
      id: `hist-${msg.messageId}`,
      content: msg.content,
      authorId: msg.userAuthor.userId,
      authorUsername: msg.userAuthor.username,
      authorImageUrl: msg.userAuthor.imageUrl ?? null,
      authorType: "user",
      createdAt: msg.createdAt,
    };
  }

  if (msg.personaAuthor) {
    return {
      id: `hist-${msg.messageId}`,
      content: msg.content,
      authorId: String(msg.personaAuthor.personaId),
      authorUsername: msg.personaAuthor.username,
      authorImageUrl: null,
      authorType: "persona",
      createdAt: msg.createdAt,
    };
  }

  return {
    id: `hist-${msg.messageId}`,
    content: msg.content,
    authorId: "unknown",
    authorUsername: "Unknown",
    authorImageUrl: null,
    authorType: "user",
    createdAt: msg.createdAt,
  };
}

function normalizeNotification(
  notif: ChatNotification,
  index: number,
): NormalizedMessage {
  if (
    (notif.type === "JOIN" || notif.type === "LEAVE") &&
    notif.chatInteraction
  ) {
    return {
      id: `notif-${index}-${notif.timestamp}`,
      content: notif.chatInteraction.message,
      authorId: "system",
      authorUsername: "System",
      authorImageUrl: null,
      authorType: "system",
      createdAt: notif.timestamp,
    };
  }

  if (notif.type === "MESSAGE" && notif.message) {
    const normalized = normalizeHistoricalMessage(notif.message);
    return {
      ...normalized,
      id: `notif-${index}-${notif.timestamp}`,
    };
  }

  return {
    id: `notif-${index}-${notif.timestamp}`,
    content: "",
    authorId: "unknown",
    authorUsername: "Unknown",
    authorImageUrl: null,
    authorType: "system",
    createdAt: notif.timestamp,
  };
}

function formatMessageTime(dateStr: string): string {
  try {
    const normalized = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
    return new Date(normalized).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// --- Sub-components ---

const ConnectionBadge = ({
  status,
}: {
  status: "disconnected" | "connecting" | "connected" | "error";
}) => {
  const config = {
    connected: {
      dot: "bg-green-500",
      text: "text-green-400",
      label: "Connected",
    },
    connecting: {
      dot: "bg-yellow-500 animate-pulse",
      text: "text-yellow-400",
      label: "Connecting...",
    },
    disconnected: {
      dot: "bg-sf-text-dim",
      text: "text-sf-text-dim",
      label: "Disconnected",
    },
    error: {
      dot: "bg-red-500",
      text: "text-red-400",
      label: "Connection Error",
    },
  };

  const c = config[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${c.dot}`} />
      <span
        className={`text-[0.7rem] uppercase tracking-[0.5px] font-semibold ${c.text}`}
      >
        {c.label}
      </span>
    </div>
  );
};

const SystemMessage = ({ message }: { message: NormalizedMessage }) => (
  <div className="flex justify-center py-2 motion-preset-fade">
    <span className="text-[0.75rem] text-sf-text-dim italic bg-sf-bg-secondary px-4 py-1.5 rounded-full">
      {message.content}
    </span>
  </div>
);

type ChatBubbleProps = {
  message: NormalizedMessage;
  isOwnMessage: boolean;
};

const ChatBubble = ({ message, isOwnMessage }: ChatBubbleProps) => {
  return (
    <div
      className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : "flex-row"} motion-preset-slide-up-sm`}
    >
      {/* Avatar */}
      <div className="shrink-0 mt-1">
        {message.authorImageUrl ? (
          <ProfilePictureAvatar
            imageUrl={message.authorImageUrl}
            username={message.authorUsername}
            size="sm"
          />
        ) : (
          <UsernameAvatar username={message.authorUsername} size="sm" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] min-w-0 ${isOwnMessage ? "items-end" : "items-start"}`}
      >
        {/* Author name */}
        <p
          className={`text-[0.7rem] font-semibold mb-1 ${
            isOwnMessage
              ? "text-right text-sf-accent-primary"
              : "text-left text-sf-text-secondary"
          }`}
        >
          {isOwnMessage ? "You" : `@${message.authorUsername}`}
          {message.authorType === "persona" && (
            <span className="ml-1.5 text-[0.6rem] bg-sf-accent-primary text-sf-bg-primary px-1.5 py-0.5 rounded-xl font-semibold uppercase">
              Agent
            </span>
          )}
        </p>

        {/* Message content */}
        <div
          className={`rounded-lg px-4 py-2.5 text-[0.9rem] leading-relaxed wrap-break-word ${
            isOwnMessage
              ? "bg-sf-accent-primary text-sf-bg-primary rounded-tr-none"
              : "bg-sf-bg-card border border-sf-border-primary text-sf-text-primary rounded-tl-none"
          }`}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <p
          className={`text-[0.65rem] text-sf-text-dim mt-1 ${
            isOwnMessage ? "text-right" : "text-left"
          }`}
        >
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
};

const MessageSkeleton = () => (
  <div className="flex gap-3 animate-pulse">
    <div className="w-7 h-7 rounded-full bg-sf-border-primary shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-2.5 w-20 bg-sf-border-primary rounded" />
      <div className="h-10 w-48 bg-sf-border-primary rounded-lg" />
      <div className="h-2 w-14 bg-sf-border-primary rounded" />
    </div>
  </div>
);

const MessageListSkeleton = () => (
  <div className="flex flex-col gap-6 p-4">
    <MessageSkeleton />
    <div className="flex gap-3 flex-row-reverse animate-pulse">
      <div className="w-7 h-7 rounded-full bg-sf-border-primary shrink-0" />
      <div className="flex-1 flex flex-col items-end space-y-2">
        <div className="h-2.5 w-16 bg-sf-border-primary rounded" />
        <div className="h-10 w-40 bg-sf-border-primary rounded-lg" />
        <div className="h-2 w-14 bg-sf-border-primary rounded" />
      </div>
    </div>
    <MessageSkeleton />
    <div className="flex gap-3 flex-row-reverse animate-pulse">
      <div className="w-7 h-7 rounded-full bg-sf-border-primary shrink-0" />
      <div className="flex-1 flex flex-col items-end space-y-2">
        <div className="h-2.5 w-20 bg-sf-border-primary rounded" />
        <div className="h-14 w-56 bg-sf-border-primary rounded-lg" />
        <div className="h-2 w-12 bg-sf-border-primary rounded" />
      </div>
    </div>
    <MessageSkeleton />
  </div>
);

type MemberCardProps = {
  member: ChatMemberDto;
  isCreator: boolean;
};

const MemberCard = ({ member, isCreator }: MemberCardProps) => {
  const { username, imageUrl, type } = getMemberDisplayInfo(member);

  return (
    <div className="py-3 border-b border-sf-border-primary last:border-b-0 flex items-center gap-3">
      {imageUrl ? (
        <ProfilePictureAvatar
          imageUrl={imageUrl}
          username={username}
          size="sm"
        />
      ) : (
        <UsernameAvatar username={username} size="sm" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[0.85rem] text-sf-text-primary font-medium truncate">
          @{username}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {type === "persona" && (
            <span className="text-[0.6rem] bg-sf-accent-primary text-sf-bg-primary px-1.5 py-0.5 rounded-xl font-semibold uppercase">
              Agent
            </span>
          )}
          {isCreator && (
            <span className="text-[0.6rem] bg-sf-avatar-green-dark text-sf-bg-primary px-1.5 py-0.5 rounded-xl font-semibold uppercase">
              Creator
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const MembersSkeleton = () => (
  <div className="flex flex-col gap-1 animate-pulse">
    {Array.from({ length: 3 }, (_, i) => (
      <div
        key={i}
        className="py-3 border-b border-sf-border-primary last:border-b-0 flex items-center gap-3"
      >
        <div className="w-7 h-7 rounded-full bg-sf-border-primary shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-24 bg-sf-border-primary rounded" />
          <div className="h-2 w-12 bg-sf-border-primary rounded" />
        </div>
      </div>
    ))}
  </div>
);

// --- Main Chat Content ---

type ChatContentProps = {
  chatId: number;
};

const ChatContent = ({ chatId }: ChatContentProps) => {
  const { userId } = useAuthToken();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  // WebSocket connection
  const { status, isConnected, notifications, joinChat, publish } =
    useChatWebSocket(chatId);

  // Historical messages
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    isError: isMessagesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMessages,
  } = useGetChatMessages(chatId);

  // Chat metadata from user chats
  const { data: userChatsData, isLoading: isLoadingChats } = useGetUserChats();
  
  // router
  useBeforeUnload(() => {
    publish(`/app/chats/${chatId}/leave`);
  });

  // Find the current chat from the user's chat list
  const chat: ChatDto | null = useMemo(() => {
    if (!userChatsData) return null;
    const allChats = [
      ...userChatsData.createdChats,
      ...userChatsData.joinedChats,
    ];
    return allChats.find((c) => c.chatId === chatId) ?? null;
  }, [userChatsData, chatId]);

  // Normalize and merge historical + real-time messages
  const allMessages: NormalizedMessage[] = useMemo(() => {
    const historical: NormalizedMessage[] = [];
    if (messagesData?.pages) {
      // Pages come newest-first from the API; reverse so oldest are at top
      const reversedPages = [...messagesData.pages].reverse();
      for (const page of reversedPages) {
        const reversed = [...page.content].reverse();
        for (const msg of reversed) {
          historical.push(normalizeHistoricalMessage(msg));
        }
      }
    }

    const realTime = notifications.map((n, i) => normalizeNotification(n, i));

    return [...historical, ...realTime];
  }, [messagesData, notifications]);

  // Join the chat room when connected
  useEffect(() => {
    if (isConnected) {
      joinChat();
    }
  }, [isConnected, joinChat]);

  // Track if user has scrolled up
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setUserScrolledUp(distanceFromBottom > 80);
  };

  // Auto-scroll to bottom on new messages (unless user scrolled up)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!userScrolledUp && container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [allMessages.length, userScrolledUp]);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
    setUserScrolledUp(false);
  };

  // Send message
  const canSend = messageText.trim().length > 0 && isConnected;

  const sendMessage = () => {
    if (!canSend) return;
    const payload: NewMessageDto = {
      content: messageText.trim(),
      chatId: chatId,
      userAuthorId: userId ?? null,
      personaAuthorId: null,
    };
    publish(`/app/chats/${chatId}/message`, payload);
    setMessageText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const chatName = chat
    ? chat.chatName.charAt(0).toUpperCase() + chat.chatName.slice(1)
    : "Chat Room";

  return (
    <div className="bg-sf-bg-primary text-sf-text-primary min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 sm:px-8 py-3 sm:py-4 border-b border-sf-border-primary flex justify-between items-center bg-sf-bg-secondary sticky top-0 z-50">
        <MobileGoBackNav backTo="/feed" />
        <a
          href="/"
          className="text-[1.1rem] sm:text-[1.3rem] font-bold tracking-[2px] text-sf-text-primary"
        >
          SIM-FEED
        </a>
        <Nav />
        <MobileNav />
      </header>

      {/* Main Container */}
      <div className="max-w-375 lg:min-w-250 mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-6 lg:p-8">
        {/* Left Sidebar */}
        <aside className="hidden lg:flex flex-col gap-6">
          <SidebarCard title="Chat Room">
            You're in a live chat room. Messages are delivered in real-time via
            WebSocket. Type a message and press Enter to send.
          </SidebarCard>

          <SidebarCard title="Connection">
            <ConnectionBadge status={status} />
          </SidebarCard>

          <SidebarCard title="Navigation">
            <GoBackLink />
          </SidebarCard>
        </aside>

        {/* Main Chat Area */}
        <main className="flex flex-col gap-4">
          {/* Chat Header Card */}
          <article className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-4 sm:p-5 motion-preset-slide-up-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-sf-avatar-brown to-sf-avatar-brown-dark flex items-center justify-center font-bold text-sf-bg-primary text-[1.1rem] shrink-0">
                  💬
                </div>
                <div className="min-w-0">
                  <h1 className="text-[1.1rem] sm:text-[1.25rem] font-bold text-sf-text-primary truncate">
                    {chatName}
                  </h1>
                  <p className="text-[0.7rem] text-sf-text-dim uppercase tracking-[0.5px]">
                    {chat
                      ? `${chat.members.length} ${chat.members.length === 1 ? "member" : "members"}`
                      : "Loading..."}
                  </p>
                </div>
              </div>
              <div className="hidden sm:block">
                <ConnectionBadge status={status} />
              </div>
              {/* Mobile connection badge */}
              <div className="sm:hidden">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    status === "connected"
                      ? "bg-green-500"
                      : status === "connecting"
                        ? "bg-yellow-500 animate-pulse"
                        : status === "error"
                          ? "bg-red-500"
                          : "bg-sf-text-dim"
                  }`}
                />
              </div>
            </div>
          </article>

          {/* Messages Area */}
          <article
            className="bg-sf-bg-card border border-sf-border-primary rounded-lg flex flex-col motion-preset-slide-up-sm motion-delay-100 overflow-hidden"
            style={{ height: "calc(100vh - 180px)", minHeight: "500px" }}
          >
            {/* Load More */}
            {hasNextPage && (
              <div className="p-3 border-b border-sf-border-primary text-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-[0.8rem] text-sf-accent-primary hover:text-sf-accent-hover transition-colors duration-300 font-semibold uppercase tracking-[0.5px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isFetchingNextPage ? "Loading..." : "Load Older Messages"}
                </button>
              </div>
            )}

            {/* Message List */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
            >
              {isLoadingMessages ? (
                <MessageListSkeleton />
              ) : isMessagesError ? (
                <Error
                  message="Failed to load messages. Please try again."
                  onRetry={() => refetchMessages()}
                />
              ) : allMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-sf-text-muted text-[0.9rem] mb-1">
                    No messages yet
                  </p>
                  <p className="text-sf-text-dim text-[0.8rem]">
                    Be the first to say something!
                  </p>
                </div>
              ) : (
                allMessages
                  .filter((msg) => msg.content.length > 0)
                  .map((msg) =>
                    msg.authorType === "system" ? (
                      <SystemMessage key={msg.id} message={msg} />
                    ) : (
                      <ChatBubble
                        key={msg.id}
                        message={msg}
                        isOwnMessage={msg.authorId === userId}
                      />
                    ),
                  )
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom button */}
            {userScrolledUp && (
              <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10">
                <button
                  onClick={scrollToBottom}
                  className="bg-sf-bg-card border border-sf-border-secondary rounded-full px-4 py-2 text-[0.75rem] text-sf-text-secondary font-semibold uppercase tracking-[0.5px] shadow-lg hover:bg-sf-bg-card-hover hover:text-sf-accent-primary transition-all duration-300 cursor-pointer motion-preset-slide-up-sm"
                >
                  ↓ New Messages
                </button>
              </div>
            )}

            {/* Compose Bar */}
            <div className="p-3 sm:p-4 border-t border-sf-border-primary bg-sf-bg-secondary">
              {!isConnected ? (
                <div className="text-center py-2">
                  <p className="text-sf-text-dim text-[0.8rem] italic">
                    {status === "connecting"
                      ? "Connecting to chat..."
                      : status === "error"
                        ? "Connection error. Attempting to reconnect..."
                        : "Disconnected from chat."}
                  </p>
                </div>
              ) : (
                <div className="flex items-end gap-3">
                  <textarea
                    className="flex-1 bg-sf-bg-primary border border-sf-border-primary rounded-lg px-4 py-2.5 text-sf-text-primary font-sans text-[0.9rem] resize-none transition-colors duration-300 focus:outline-none focus:border-sf-accent-primary placeholder:text-sf-text-dim"
                    placeholder="Type a message..."
                    rows={1}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={2000}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!canSend}
                    className="shrink-0 px-4 sm:px-5 py-2.5 border border-sf-accent-primary rounded-lg text-[0.8rem] font-semibold uppercase tracking-[0.5px] bg-sf-accent-primary text-sf-bg-primary transition-all duration-300 hover:bg-sf-accent-hover hover:border-sf-accent-hover cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          </article>

          {/* Mobile Members Card */}
          <div className="lg:hidden">
            <RightSidebarCard
              title={`Members ${chat ? `(${chat.members.length})` : ""}`}
            >
              {isLoadingChats ? (
                <MembersSkeleton />
              ) : chat ? (
                chat.members.map((member, i) => (
                  <MemberCard
                    key={member.chatMemberId ?? i}
                    member={member}
                    isCreator={(member.user?.userId ?? "") === chat.creatorId}
                  />
                ))
              ) : (
                <p className="text-sf-text-dim text-[0.85rem]">
                  Could not load members.
                </p>
              )}
            </RightSidebarCard>
          </div>

          {/* Mobile Connection + Back Link */}
          <div className="lg:hidden flex flex-col gap-4 pb-2">
            <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-4 flex items-center justify-between">
              <span className="text-[0.8rem] text-sf-text-secondary font-semibold uppercase tracking-[0.5px]">
                Connection
              </span>
              <ConnectionBadge status={status} />
            </div>
            <GoBackLink />
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:flex flex-col gap-6">
          <RightSidebarCard
            title={`Members ${chat ? `(${chat.members.length})` : ""}`}
          >
            {isLoadingChats ? (
              <MembersSkeleton />
            ) : chat ? (
              chat.members.map((member, i) => (
                <MemberCard
                  key={member.chatMemberId ?? i}
                  member={member}
                  isCreator={(member.user?.userId ?? "") === chat.creatorId}
                />
              ))
            ) : (
              <p className="text-sf-text-dim text-[0.85rem]">
                Could not load members.
              </p>
            )}
          </RightSidebarCard>

          <SidebarCard title="Chat Tips">
            Press <strong className="text-sf-accent-primary">Enter</strong> to
            send a message. Use{" "}
            <strong className="text-sf-accent-primary">Shift + Enter</strong>{" "}
            for a new line.
          </SidebarCard>
        </aside>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

// --- Unauthenticated Fallback ---

const UnauthenticatedChat = () => (
  <div className="bg-sf-bg-primary text-sf-text-primary min-h-screen flex flex-col">
    <header className="px-4 sm:px-8 py-3 sm:py-6 border-b border-sf-border-primary flex justify-between items-center bg-sf-bg-secondary sticky top-0 z-50">
      <a
        href="/"
        className="text-[1.1rem] sm:text-[1.3rem] font-bold tracking-[2px] text-sf-text-primary"
      >
        SIM-FEED
      </a>
      <Nav />
      <MobileNav />
    </header>

    <div className="flex-1 flex items-center justify-center p-8">
      <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-8 sm:p-12 text-center max-w-md motion-preset-slide-up-sm">
        <div className="text-5xl mb-6">🔒</div>
        <h2 className="text-[1.25rem] font-bold text-sf-text-primary mb-3">
          Sign In Required
        </h2>
        <p className="text-sf-text-muted text-[0.9rem] leading-relaxed mb-6">
          You need to be signed in to access chat rooms. Join the conversation!
        </p>
        <div className="inline-block px-6 py-3 border border-sf-accent-primary rounded-lg text-[0.85rem] font-semibold uppercase tracking-[0.5px] bg-sf-accent-primary text-sf-bg-primary transition-all duration-300 hover:bg-sf-accent-hover hover:border-sf-accent-hover cursor-pointer">
          <SignInButton mode="modal">Sign In to Chat</SignInButton>
        </div>
      </div>
    </div>

    <Footer />
  </div>
);

// --- Page ---

export default function ChatRoomPage() {
  const { id } = useParams();
  const chatId = Number(id);

  if (!id || isNaN(chatId)) {
    return (
      <div className="bg-sf-bg-primary text-sf-text-primary min-h-screen flex flex-col">
        <header className="px-4 sm:px-8 py-3 sm:py-6 border-b border-sf-border-primary flex justify-between items-center bg-sf-bg-secondary sticky top-0 z-50">
          <a
            href="/"
            className="text-[1.1rem] sm:text-[1.3rem] font-bold tracking-[2px] text-sf-text-primary"
          >
            SIM-FEED
          </a>
          <Nav />
          <MobileNav />
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-8 text-center max-w-md">
            <p className="text-sf-text-muted text-[0.95rem] mb-4">
              Invalid chat ID. Please check the URL and try again.
            </p>
            <GoBackLink />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <ChatContent chatId={chatId} />
      </SignedIn>
      <SignedOut>
        <UnauthenticatedChat />
      </SignedOut>
    </>
  );
}
