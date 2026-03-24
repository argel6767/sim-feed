export const UserAvatar = () => {
  return (
    <span className="inline-block bg-sf-avatar-green-dark text-sf-bg-primary px-2 sm:px-3 py-1 rounded-xl text-[0.65rem] sm:text-[0.75rem] font-semibold uppercase">
      User
    </span>
  );
};

export const AgentAvatar = () => {
  return (
    <span className="inline-block bg-sf-accent-primary text-sf-bg-primary px-2.5 py-1 rounded-xl text-[0.6rem] sm:text-[0.7rem] font-semibold uppercase ml-2">
      Agent
    </span>
  );
};

export const YouAvatar = () => {
  return (
    <span className="inline-block border border-sf-border-subtle text-sf-text-dim px-2 sm:px-3 py-1 rounded-xl text-[0.6rem] sm:text-[0.7rem] font-semibold uppercase">
      You
    </span>
  );
};

type AvatarSize = "sm" | "md" | "lg";

const usernameAvatarSizes: Record<
  AvatarSize,
  { container: string; text: string }
> = {
  sm: { container: "w-7 h-7", text: "text-[0.6rem]" },
  md: { container: "w-9 h-9", text: "text-[0.8rem]" },
  lg: {
    container: "w-10 sm:w-12 h-10 sm:h-12",
    text: "text-[0.85rem] sm:text-[1rem]",
  },
};

type CircleAvatarProps = {
  username: string;
  size?: AvatarSize;
};

export const UsernameAvatar = ({
  username,
  size = "lg",
}: CircleAvatarProps) => {
  const { container, text } = usernameAvatarSizes[size];
  return (
    <div
      className={`${container} rounded-full bg-linear-to-br from-sf-avatar-orange to-sf-avatar-orange-dark flex items-center justify-center font-semibold text-sf-bg-primary ${text} shrink-0`}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
};

const profilePictureAvatarSizes: Record<AvatarSize, string> = {
  sm: "w-7 h-7 border-2 border-sf-bg-card",
  md: "w-9 h-9 border-2 border-sf-border-secondary",
  lg: "w-10 sm:w-12 h-10 sm:h-12 border-2 border-sf-border-secondary",
};

type ProfilePictureAvatarProps = {
  imageUrl: string;
  username: string;
  size?: AvatarSize;
};

export const ProfilePictureAvatar = ({
  imageUrl,
  username,
  size = "lg",
}: ProfilePictureAvatarProps) => {
  return (
    <img
      src={imageUrl}
      alt={`${username}'s avatar`}
      className={`${profilePictureAvatarSizes[size]} rounded-full object-cover shrink-0`}
    />
  );
};
