import { useModal } from "~/hooks/useModal";
import { SidebarModal } from "./modals";
import { SidebarFooter } from "./footer";
import { useGetUserChats } from "~/hooks/useGetUserChats";
import type { ChatDto, ChatMemberDto } from "~/lib/user-api-dtos";
import { ProfilePictureAvatar, UsernameAvatar } from "./avatars";
import { Link } from "react-router";

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
  const formattedChatName = chatName.substring(0, 1).toUpperCase()+chatName.substring(1);

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

        <Link to={`/chat/${chat.chatId}`} className="text-[0.7rem] text-sf-text-dim uppercase tracking-[0.5px] transition-colors duration-300 hover:text-sf-accent-primary">
          Open →
        </Link>
      </footer>
    </article>
  );
};

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
      <div className="flex flex-col gap-4 justify-center bg-sf-bg-card border border-sf-border-primary rounded-lg p-6 text-center">
        <p className="text-sf-text-muted text-sm">No chats yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
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
        width="96"
      >
        <div className="p-2">
          <ChatList />
        </div>
      </SidebarModal>
    </>
  );
};
