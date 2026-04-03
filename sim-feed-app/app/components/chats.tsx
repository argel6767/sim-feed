import { useModal } from "~/hooks/useModal";
import { SidebarModal, Modal } from "./modals";
import { SidebarFooter } from "./footer";
import { useGetUserChats } from "~/hooks/useGetUserChats";
import type {
  ChatDto,
  ChatMemberDto,
  NewChatDto,
  UserDto,
} from "~/lib/user-api-dtos";
import { ProfilePictureAvatar, UsernameAvatar } from "./avatars";
import { Link } from "react-router";
import { UserSearchSelect } from "./user-search";
import { useAuthToken } from "~/contexts/auth-token-context";
import { useState, useCallback } from "react";
import { useStatus } from "~/hooks/useStatus";
import { createChat } from "~/api/user-api/chats";
import { useQueryClient } from "@tanstack/react-query";

const ChatSkeletonCard = () => {
  return (
    <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-4 sm:p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-sf-border-primary shrink-0" />
        <div className="flex-1">
          <div className="h-3 w-32 bg-sf-border-primary rounded mb-2" />
          <div className="h-2 w-16 bg-sf-border-primary rounded" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-sf-border-primary">
        <div className="flex items-center">
          <div className="w-7 h-7 rounded-full bg-sf-border-primary border-2 border-sf-bg-card" />
          <div className="w-7 h-7 rounded-full bg-sf-border-primary border-2 border-sf-bg-card -ml-2.5" />
          <div className="w-7 h-7 rounded-full bg-sf-border-primary border-2 border-sf-bg-card -ml-2.5" />
        </div>
        <div className="h-2 w-10 bg-sf-border-primary rounded" />
      </div>
    </div>
  );
};

const ChatListSkeleton = ({ count = 3 }) => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }, (_, index) => (
        <ChatSkeletonCard key={index} />
      ))}
    </div>
  );
};

type ChatCardProps = {
  chat: ChatDto;
};

const ChatCard = ({ chat }: ChatCardProps) => {
  const { chatName, members, creatorId } = chat;
  const maxRenderedMembers = Math.min(members.length, 4);
  const renderedMembers = members.slice(0, maxRenderedMembers);
  const extraCount = members.length - maxRenderedMembers;

  const getDisplayInfo = (m: ChatMemberDto) => {
    if (m.user) return { username: m.user.username, imageUrl: m.user.imageUrl };
    if (m.persona) return { username: m.persona.username, imageUrl: null };
    return { username: "Unknown", imageUrl: null };
  };

  const creatorMember = members.find((m) => m.user?.userId === creatorId);
  const { username, imageUrl } = getDisplayInfo(creatorMember ?? members[0]);
  const formattedChatName =
    chatName.substring(0, 1).toUpperCase() + chatName.substring(1);

  return (
    <article className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-4 sm:p-5 transition-all duration-300 hover:border-sf-border-secondary hover:bg-sf-bg-card-hover cursor-pointer">
      {/* Header: creator avatar + chat name */}
      <div className="flex items-center gap-3 mb-4">
        {imageUrl ? (
          <ProfilePictureAvatar
            imageUrl={imageUrl}
            username={username}
            size="md"
          />
        ) : (
          <UsernameAvatar username={username} size="md" />
        )}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold ${chatName.length > 25 ? "text-xs" : "text-sm"} sm:text-base text-sf-text-primary truncate`}
          >
            {formattedChatName}
          </h3>
          <p className="text-[0.7rem] text-sf-text-dim uppercase tracking-[0.5px] mt-0.5">
            {members.length} {members.length === 1 ? "member" : "members"}
          </p>
        </div>
      </div>

      {/* Footer: stacked member avatars + open label */}
      <footer className="flex items-center justify-between pt-3 border-t border-sf-border-primary">
        <div className="flex items-center">
          {renderedMembers.map((m, i) => {
            const { username: mUsername, imageUrl: mImageUrl } =
              getDisplayInfo(m);
            const key = m.user?.userId ?? m.persona?.personaId ?? i;

            return (
              <div
                key={key}
                className={i > 0 ? "-ml-2.5" : ""}
                style={{ zIndex: maxRenderedMembers - i }}
              >
                {mImageUrl ? (
                  <ProfilePictureAvatar
                    imageUrl={mImageUrl}
                    username={mUsername}
                    size="sm"
                  />
                ) : (
                  <UsernameAvatar username={mUsername} size="sm" />
                )}
              </div>
            );
          })}

          {extraCount > 0 && (
            <div
              className="w-7 h-7 rounded-full bg-sf-border-secondary flex items-center justify-center -ml-2.5 border-2 border-sf-bg-card"
              style={{ zIndex: 0 }}
            >
              <span className="text-[0.6rem] text-sf-text-secondary font-semibold">
                +{extraCount}
              </span>
            </div>
          )}
        </div>

        <Link
          to={`/chats/${chat.chatId}`}
          className="text-[0.7rem] text-sf-text-dim uppercase tracking-[0.5px] transition-colors duration-300 hover:text-sf-accent-primary"
        >
          Open →
        </Link>
      </footer>
    </article>
  );
};

// ─── Create Chat Form ────────────────────────────────────────────────────────

type CreateChatFormProps = {
  onSuccess: () => void;
};

const CreateChatForm = ({ onSuccess }: CreateChatFormProps) => {
  const [chatName, setChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserDto[]>([]);
  const { isLoading, isError, setLoading, setError, setIdle } = useStatus();
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();
  const { userId } = useAuthToken();
  const currentUserId = userId;

  const handleSelect = useCallback((user: UserDto) => {
    setSelectedUsers((prev) => {
      if (prev.some((u) => u.id === user.id)) return prev;
      return [...prev, user];
    });
  }, []);

  const handleRemove = useCallback((userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const canCreate = selectedUsers.length > 0;

  const handleCreate = async () => {
    if (!canCreate) return;

    setLoading();
    setErrorMessage("");

    const newChat: NewChatDto = {
      chatName: chatName.trim().length > 0 ? chatName.trim() : null,
      memberIds: selectedUsers.map((u) => u.id),
    };

    try {
      await createChat(newChat);
      queryClient.refetchQueries({ queryKey: ["userChats"] });
      setChatName("");
      setSelectedUsers([]);
      setIdle();
      onSuccess();
    } catch {
      setError();
      setErrorMessage("Failed to create chat. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Chat Name Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sf-text-primary text-xs uppercase tracking-[0.5px] font-semibold">
          Chat Name
          <span className="text-sf-text-muted font-normal ml-1">
            (optional)
          </span>
        </label>
        <input
          type="text"
          className="w-full bg-sf-bg-primary border border-sf-border-primary rounded p-2 text-sf-text-primary font-sans text-[1rem] resize-none transition-colors duration-300 focus:outline-none focus:border-sf-accent-primary"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          placeholder="Give your chat a name..."
          maxLength={100}
          disabled={isLoading}
        />
      </div>

      {/* Member Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sf-text-primary text-xs uppercase tracking-[0.5px] font-semibold">
          Members
          {selectedUsers.length > 0 && (
            <span className="text-sf-text-muted font-normal ml-1">
              ({selectedUsers.length} selected)
            </span>
          )}
        </label>
        <UserSearchSelect
          selectedUsers={selectedUsers}
          onSelect={handleSelect}
          onRemove={handleRemove}
          excludeUserIds={currentUserId ? [currentUserId] : []}
        />
      </div>

      {/* Error Message */}
      {isError && errorMessage && (
        <div className="text-red-400 text-sm text-center py-1 motion-preset-fade-sm">
          {errorMessage}
        </div>
      )}

      {/* Create Button */}
      <button
        type="button"
        onClick={handleCreate}
        disabled={!canCreate || isLoading}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold uppercase tracking-[1px] transition-all duration-300 ${
          canCreate && !isLoading
            ? "bg-sf-accent-primary text-sf-bg-primary hover:opacity-90 cursor-pointer"
            : "bg-sf-border-primary text-sf-text-muted cursor-not-allowed"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M4 12a8 8 0 018-8" strokeLinecap="round" />
            </svg>
            Creating...
          </span>
        ) : (
          "Create Chat"
        )}
      </button>
    </div>
  );
};

// ─── Create Chat Modal Trigger ───────────────────────────────────────────────

const CreateChatButton = () => {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="w-full py-3 border border-dashed border-sf-border-secondary rounded-lg text-sf-text-tertiary text-sm uppercase tracking-[0.5px] transition-all duration-300 hover:border-sf-accent-primary hover:text-sf-accent-primary hover:bg-sf-bg-card-hover cursor-pointer flex items-center justify-center gap-2"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M10 4v12M4 10h12" />
        </svg>
        New Chat
      </button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Create a Chat"
        width="w-full max-w-md"
      >
        <CreateChatForm onSuccess={close} />
      </Modal>
    </>
  );
};

// ─── Chat List ───────────────────────────────────────────────────────────────

const ChatList = () => {
  const { isLoading, isError, data } = useGetUserChats();
  if (isLoading) return <ChatListSkeleton />;
  if (isError)
    return (
      <div className="text-sf-text-muted text-sm text-center py-4">
        Failed to load chats
      </div>
    );
  if (!data)
    return (
      <div className="text-sf-text-muted text-sm text-center py-4">
        No chats found
      </div>
    );

  const allChats = [...data.createdChats, ...data.joinedChats];

  if (allChats.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <CreateChatButton />
        <div className="flex flex-col gap-4 justify-center bg-sf-bg-card border border-sf-border-primary rounded-lg p-6 text-center">
          <p className="text-sf-text-muted text-sm">
            No chats yet. Create one to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CreateChatButton />

      {data.createdChats.length > 0 && (
        <span className="flex flex-col gap-4 py-2">
          <h2 className="text-sf-text-primary text-sm uppercase tracking-[0.5px]">
            Your Chats
          </h2>
          {data.createdChats.map((chat, index) => (
            <div
              key={chat.chatId}
              className="motion-preset-slide-up-sm"
              style={{ animationDelay: `${(index + 1) * 75}ms` }}
            >
              <ChatCard chat={chat} />
            </div>
          ))}
        </span>
      )}

      {data.joinedChats.length > 0 && (
        <span className="flex flex-col gap-4 py-2">
          <h2 className="text-sf-text-primary text-sm uppercase tracking-[0.5px]">
            Joined Chats
          </h2>
          {data.joinedChats.map((chat, index) => (
            <div
              key={chat.chatId}
              className="motion-preset-slide-up-sm"
              style={{ animationDelay: `${(index + 1) * 75}ms` }}
            >
              <ChatCard chat={chat} />
            </div>
          ))}
        </span>
      )}
    </div>
  );
};

export const ChatListModal = () => {
  const { isOpen, close, open } = useModal();

  return (
    <>
      <button
        className="text-sf-text-tertiary text-[0.90rem] sm:text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary hover:cursor-pointer motion-preset-fade-sm"
        onClick={open}
      >
        Messages
      </button>
      <SidebarModal
        title="Chats"
        isOpen={isOpen}
        onClose={close}
        footer={<SidebarFooter />}
        width="w-xl"
      >
        <div className="p-2">
          <ChatList />
        </div>
      </SidebarModal>
    </>
  );
};
