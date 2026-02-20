import { useState } from "react";
import { sleep } from "~/lib/sleep";
import { unfollow, follow } from "~/api/user-api/follows";
import { useAuth, useUser } from "@clerk/react-router";
import type { NewFollowDto } from "~/lib/user-api-dtos";
import { useGetIsUserFollowing } from "~/hooks/useGetIsUserFollowing";
import type { Optional } from "~/lib/types";
import { queryClient } from "~/root";

type FollowButtonContainerProps = {
  user_author: Optional<string>;
  persona_author: Optional<number>;
};

export const FollowButtonContainer = ({
  user_author,
  persona_author,
}: FollowButtonContainerProps) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const {
    data: isUserFollowing,
    isLoading: isUserFollowingLoading,
    isError: isUserFollowingError,
  } = useGetIsUserFollowing(user_author, persona_author, getToken);

  const isAuthorTheUser = () => {
    if (user_author) {
      return user_author === user?.id;
    }
    return false;
  };

  if (isUserFollowingLoading) {
    return <FollowButtonSkeleton />;
  }

  if (isUserFollowingError || !isUserFollowing || isAuthorTheUser()) {
    return null;
  }

  return (
    <main>
      {isUserFollowing.isFollowing ? (
        <Unfollow
          followId={isUserFollowing.followId}
          getToken={getToken}
          userAuthor={user_author}
          personaAuthor={persona_author}
        />
      ) : (
        <Follow
          userAuthor={user_author}
          personaAuthor={persona_author}
          getToken={getToken}
        />
      )}
    </main>
  );
};

type FollowProps = {
  userAuthor: Optional<string>;
  personaAuthor: Optional<number>;
  getToken: () => Promise<string | null>;
};

const Follow = ({ userAuthor, personaAuthor, getToken }: FollowProps) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const newFollow: NewFollowDto = {
    userId: userAuthor,
    personaId: personaAuthor,
  };
  const queryKey = ["isFollowing", userAuthor, personaAuthor];

  const createFollow = async () => {
    setBusy(true);
    setError(false);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token available");
      const data = await follow(newFollow, token);
      queryClient.setQueryData(queryKey, {
        isFollowing: true,
        followId: data.id,
      });
    } catch {
      setError(true);
      await sleep(2000);
      setError(false);
    } finally {
      setBusy(false);
    }
  };

  return <FollowButton onClick={createFollow} disabled={busy} error={error} />;
};

type UnfollowProps = {
  followId: number;
  getToken: () => Promise<string | null>;
  userAuthor: Optional<string>;
  personaAuthor: Optional<number>;
};

const Unfollow = ({
  followId,
  getToken,
  userAuthor,
  personaAuthor,
}: UnfollowProps) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const queryKey = ["isFollowing", userAuthor, personaAuthor];

  const removeFollow = async () => {
    setBusy(true);
    setError(false);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token available");
      await unfollow(followId, token);
      queryClient.setQueryData(queryKey, {
        isFollowing: false,
        followId: null,
      });
    } catch {
      setError(true);
      await sleep(2000);
      setError(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <UnfollowButton onClick={removeFollow} disabled={busy} error={error} />
  );
};

const FollowButtonSkeleton = () => {
  return (
    <div className="h-[30px] w-[90px] rounded-xl bg-sf-bg-card animate-pulse" />
  );
};

type ButtonProps = {
  onClick: () => void;
  disabled: boolean;
  error: boolean;
};

const FollowButton = ({ onClick, disabled }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative px-4 py-1 rounded-xl text-[0.65rem] sm:text-[0.75rem] font-semibold uppercase tracking-[0.5px] border border-sf-accent-primary text-sf-accent-primary bg-transparent transition-all duration-300 hover:bg-sf-accent-primary hover:text-sf-bg-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="group-hover:hidden">Follow</span>
      <span className="hidden group-hover:inline">Follow</span>
    </button>
  );
};

const UnfollowButton = ({ onClick, disabled }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative px-4 py-1 rounded-xl text-[0.65rem] sm:text-[0.75rem] font-semibold uppercase tracking-[0.5px] border transition-all duration-300 cursor-pointer border-sf-accent-primary bg-sf-accent-primary text-sf-bg-primary hover:border-red-500/60 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="group-hover:hidden">Following</span>
      <span className="hidden group-hover:inline">Unfollow</span>
    </button>
  );
};
