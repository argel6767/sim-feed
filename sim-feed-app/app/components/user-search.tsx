import { useModal } from "~/hooks/useModal";
import { Modal } from "./modals";
import { useDebounce } from "use-debounce";
import { useState, useMemo } from "react";
import { useSearchUsers } from "~/hooks/useSearchUsers";
import type { UserDto } from "~/lib/user-api-dtos";
import { EnhancedLink } from "./link";

// ─── Shared Utilities ────────────────────────────────────────────────────────

const shortenBio = (bio: string | null | undefined, maxLength = 40): string => {
  if (!bio || bio.length === 0)
    return "This user hasn't written their bio yet.";
  if (bio.length <= maxLength) return bio;
  return bio.slice(0, maxLength) + "...";
};

const formatUsername = (username: string): string =>
  username.charAt(0).toUpperCase() + username.slice(1);

// ─── Shared Skeleton / Loading Components ────────────────────────────────────

const UserQueryLoading = () => {
  return (
    <div className="bg-sf-bg-primary border border-sf-border-primary rounded-md p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-8 h-8 rounded-full bg-sf-border-primary" />

        <div className="flex-1">
          <div className="flex gap-2 items-center">
            <div className="h-3 w-25 bg-sf-border-primary rounded" />
          </div>
        </div>
      </div>
      <div className="mb-4 space-y-2">
        <div className="h-2 bg-sf-border-primary rounded w-full" />
        <div className="h-2 bg-sf-border-primary rounded w-full" />
      </div>
    </div>
  );
};

const UserQuerySkeleton = ({ count = 3 }) => {
  return (
    <main className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {Array.from({ length: count }, (_, index) => (
          <UserQueryLoading key={index} />
        ))}
      </div>
    </main>
  );
};

// ─── Shared Avatar ───────────────────────────────────────────────────────────

type UserAvatarProps = {
  username: string;
  size?: "sm" | "md";
};

const UserAvatar = ({ username, size = "md" }: UserAvatarProps) => {
  const sizeClasses =
    size === "sm"
      ? "w-6 h-6 text-[1rem]"
      : "w-8 h-8 sm:w-10 sm:h-10 text-[1.25rem] sm:text-[1.5rem]";

  return (
    <div
      className={`${sizeClasses} rounded-full bg-linear-to-br from-sf-avatar-orange to-sf-avatar-orange-dark flex items-center justify-center font-semibold text-sf-bg-primary shrink-0`}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
};

// ─── Shared Search Input ─────────────────────────────────────────────────────

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const SearchInput = ({
  value,
  onChange,
  placeholder = "Enter a username",
}: SearchInputProps) => {
  return (
    <label>
      <input
        type="text"
        className="w-full bg-sf-bg-primary border border-sf-border-primary rounded p-2 text-sf-text-primary font-sans text-[1rem] resize-none transition-colors duration-300 focus:outline-none focus:border-sf-accent-primary mb-4"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={50}
      />
    </label>
  );
};

// ─── Shared Scrollable Results Container ─────────────────────────────────────

type ScrollableResultsProps = {
  children: React.ReactNode;
};

const ScrollableResults = ({ children }: ScrollableResultsProps) => (
  <div className="max-h-90 overflow-y-scroll [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-track]:bg-transparent">
    {children}
  </div>
);

// ─── Original UserCard (navigable, for the "Find a User" modal) ──────────────

type UserCardProps = {
  user: UserDto;
  index: number;
};

const UserCard = ({ user, index }: UserCardProps) => {
  const formattedName = formatUsername(user.username);
  const destination = `/users/${user.id}`;

  return (
    <div
      className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-2 sm:p-4 transition-all duration-300 hover:border-sf-border-secondary hover:bg-sf-bg-card-hover motion-preset-slide-up-sm flex flex-col items-center gap-4 w-full"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <header className="flex items-center gap-4 w-full">
        <UserAvatar username={user.username} />
        <EnhancedLink destination={destination}>
          <p className="mt-2 text-sf-text-primary font-sans text-lg transition-colors duration-300 hover:text-sf-accent-primary">
            {formattedName}
          </p>
        </EnhancedLink>
      </header>
      <footer className="w-full flex justify-between items-center gap-2 p-2">
        <p className="text-sm sm:text-md text-sf-text-muted leading-relaxed line-clamp-2 w-full flex-1 min-w-0">
          {shortenBio(user.bio)}
        </p>
        <EnhancedLink destination={destination} message="View Full Profile →" />
      </footer>
    </div>
  );
};

// ─── Original UserContainer (list of navigable cards) ────────────────────────

type UserContainerProps = {
  users: UserDto[];
};

const UserContainer = ({ users }: UserContainerProps) => {
  if (users.length === 0) {
    return <p className="font-semibold w-full text-center">No users found</p>;
  }

  return (
    <ScrollableResults>
      {users.map((user, index) => (
        <UserCard key={user.id} user={user} index={index} />
      ))}
    </ScrollableResults>
  );
};

// ─── Original UserSearchQuery (used inside the "Find a User" modal) ──────────

const UserSearchQuery = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  const { data, isLoading, isError } = useSearchUsers(debouncedQuery);

  return (
    <div className="flex flex-col gap-4">
      <SearchInput value={query} onChange={setQuery} />
      {isLoading && <UserQuerySkeleton />}
      {isError && <p>Error</p>}
      {data && <UserContainer users={data} />}
    </div>
  );
};

// ─── Original Exported UserSearch (the "Find a User" modal trigger) ──────────

export const UserSearch = () => {
  const { isOpen, open, close } = useModal();
  return (
    <>
      <button
        className="text-sf-text-tertiary text-[0.90rem] sm:text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary hover:cursor-pointer motion-preset-fade-sm"
        onClick={open}
      >
        Users
      </button>
      <Modal isOpen={isOpen} onClose={close} title="Find a User">
        <UserSearchQuery />
      </Modal>
    </>
  );
};

// ─── New: Selectable UserCard (clickable, for UserSearchSelect) ──────────────

type SelectableUserCardProps = {
  user: UserDto;
  index: number;
  onSelect: (user: UserDto) => void;
};

const SelectableUserCard = ({
  user,
  index,
  onSelect,
}: SelectableUserCardProps) => {
  const formattedName = formatUsername(user.username);

  return (
    <button
      type="button"
      onClick={() => onSelect(user)}
      className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-2 sm:p-4 transition-all duration-300 hover:border-sf-accent-primary hover:bg-sf-bg-card-hover motion-preset-slide-up-sm flex items-center gap-4 w-full text-left cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <UserAvatar username={user.username} size="sm" />
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-sf-text-primary font-sans text-base truncate">
          {formattedName}
        </p>
        <p className="text-sm text-sf-text-muted leading-relaxed truncate">
          {shortenBio(user.bio, 60)}
        </p>
      </div>
    </button>
  );
};

// ─── New: Selected User Chip ─────────────────────────────────────────────────

type UserChipProps = {
  user: UserDto;
  onRemove: (userId: string) => void;
};

const UserChip = ({ user, onRemove }: UserChipProps) => {
  return (
    <span className="inline-flex items-center gap-1.5 bg-sf-bg-card border border-sf-border-primary rounded-full px-3 py-1 text-sm text-sf-text-primary transition-colors duration-200">
      <UserAvatar username={user.username} size="sm" />
      <span className="truncate max-w-24">{formatUsername(user.username)}</span>
      <button
        type="button"
        onClick={() => onRemove(user.id)}
        className="ml-0.5 text-sf-text-muted hover:text-sf-accent-primary transition-colors duration-200 cursor-pointer font-semibold text-base leading-none"
        aria-label={`Remove ${user.username}`}
      >
        ×
      </button>
    </span>
  );
};

// ─── New: Selectable User Results Container ──────────────────────────────────

type SelectableUserContainerProps = {
  users: UserDto[];
  onSelect: (user: UserDto) => void;
};

const SelectableUserContainer = ({
  users,
  onSelect,
}: SelectableUserContainerProps) => {
  if (users.length === 0) {
    return (
      <p className="font-semibold w-full text-center text-sf-text-muted text-sm py-2">
        No users found
      </p>
    );
  }

  return (
    <ScrollableResults>
      <div className="flex flex-col gap-2">
        {users.map((user, index) => (
          <SelectableUserCard
            key={user.id}
            user={user}
            index={index}
            onSelect={onSelect}
          />
        ))}
      </div>
    </ScrollableResults>
  );
};

// ─── New: Exported UserSearchSelect (for "Create Chat" and similar forms) ────

type UserSearchSelectProps = {
  selectedUsers: UserDto[];
  onSelect: (user: UserDto) => void;
  onRemove: (userId: string) => void;
  excludeUserIds?: string[];
};

export const UserSearchSelect = ({
  selectedUsers,
  onSelect,
  onRemove,
  excludeUserIds = [],
}: UserSearchSelectProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  const { data, isLoading, isError } = useSearchUsers(debouncedQuery);

  const excludedIds = useMemo(
    () => new Set([...selectedUsers.map((u) => u.id), ...excludeUserIds]),
    [selectedUsers, excludeUserIds],
  );

  const filteredResults = useMemo(() => {
    if (!data) return undefined;
    return data.filter((user) => !excludedIds.has(user.id));
  }, [data, excludedIds]);

  return (
    <div className="flex flex-col gap-3">
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <UserChip key={user.id} user={user} onRemove={onRemove} />
          ))}
        </div>
      )}

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search users to add..."
      />

      {isLoading && <UserQuerySkeleton count={2} />}
      {isError && (
        <p className="text-sm text-sf-text-muted text-center">
          Something went wrong while searching.
        </p>
      )}
      {filteredResults && (
        <SelectableUserContainer users={filteredResults} onSelect={onSelect} />
      )}
    </div>
  );
};
