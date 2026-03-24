import { useModal } from "~/hooks/useModal";
import { Modal } from "./modals";
import { useDebounce } from "use-debounce";
import { useState } from "react";
import { useSearchUsers } from "~/hooks/useSearchUsers";
import type { UserDto } from "~/lib/user-api-dtos";
import { EnhancedLink } from "./link";

type UserCardProps = {
  user: UserDto;
  index: number;
}

const UserCard = ({ user, index }: UserCardProps) => {
  
  const shortenedBio = () => {
    if (!user.bio || user.bio.length === 0) return "This user hasn't written their bio yet.";
    if (user.bio.length <= 40) return user.bio;
    return user.bio.slice(0, 40) + "...";
  };
  
  const formattedUsername = user.username.charAt(0).toUpperCase() + user.username.slice(1);
  const destination = `/users/${user.id}`;
  
  return (
    <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-2 sm:p-4 transition-all duration-300 hover:border-sf-border-secondary hover:bg-sf-bg-card-hover motion-preset-slide-up-sm flex flex-col items-center gap-4 w-full"
      style={{ animationDelay: `${index * 50}ms` }}>
      <header className="flex items-center gap-4 w-full">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-sf-avatar-orange to-sf-avatar-orange-dark flex items-center justify-center font-semibold text-sf-bg-primary text-[1.25rem] sm:text-[1.5rem] shrink-0">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <EnhancedLink destination={destination}>
          <p className="mt-2 text-sf-text-primary font-sans text-lg transition-colors duration-300 hover:text-sf-accent-primary">{formattedUsername}</p>
      </EnhancedLink>
      </header>
      <footer className="w-full flex justify-between items-center gap-2 p-2">
        <p className="text-sm sm:text-md text-sf-text-muted leading-relaxed line-clamp-2 w-full flex-1 min-w-0">
          {shortenedBio()}
        </p>
        <EnhancedLink destination={destination} message="View Full Profile →"/>
      </footer>
    </div>
  );
};

type UserContainerProps = {
  users: UserDto[];
}

const UserContainer = ({ users }: UserContainerProps) => {
  if (users.length === 0) {
    return (
      <p className="font-semibold w-full text-center">No users found</p>
    )
  }
  
  return (
    <div className="max-h-90 overflow-y-scroll [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-track]:bg-transparent">
      {users.map((user, index) => <UserCard key={user.id} user={user} index={index} />)}
    </div>
  );
};

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
  )
}

const UserQuerySkeleton = ({count = 3}) => {
  return (
    <main className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {Array.from({ length: count }, (_, index) => (
          <UserQueryLoading key={index} />
        ))}
      </div>
    </main>
  );
}

const UserSearchQuery = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  const {data, isLoading, isError} = useSearchUsers(debouncedQuery);
  return (
    <div className="flex flex-col gap-4">
      <label>
        <input type="text"
          className="w-full bg-sf-bg-primary border border-sf-border-primary rounded p-2 text-sf-text-primary font-sans text-[1rem] resize-none transition-colors duration-300 focus:outline-none focus:border-sf-accent-primary mb-4"
          value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter a username" maxLength={50}/>
      </label>
      {isLoading && <UserQuerySkeleton />}
      {isError && <p>Error</p>}
      {data && <UserContainer users={data} />}
    </div>
  );
};

export const UserSearch = () => {
  const { isOpen, open, close } = useModal();
  return (
    <>
      <button className="text-sf-text-tertiary text-[0.90rem] sm:text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary hover:cursor-pointer motion-preset-fade-sm" onClick={open}>Users</button>
      <Modal isOpen={isOpen} onClose={close} title="Find a User">
        <UserSearchQuery />
      </Modal>
    </>
  );
};
