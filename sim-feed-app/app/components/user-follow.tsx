import { useGetUserFollowers, useGetUserFollows } from "~/hooks/user-follow-stats";
import type { FollowDto } from "~/lib/user-api-dtos";
import { EnhancedLink } from "~/components/link";

type UserFollowParams = {
  id: string;
}

const FollowSkeleton = () => {
  return (
      <div className="flex bg-sf-bg-primary border border-sf-border-primary rounded-md p-3 items-center gap-4 py-2 animate-pulse">
        <div className="size-10 rounded-full bg-sf-border-primary " />
        <div className="h-4 w-36 rounded-md bg-sf-border-primary " />
      </div>
    );
}

const FollowSkeletonList = () => {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <FollowSkeleton key={i} />
      ))}
  </div>
    );
}

type Relation = "follows" | "followers";

type UserFollowProps = {
  relation: Relation;
}

const UserFollowError = ({ relation }: UserFollowProps) => {
  return (
    <div className="text-center">
      <p className="text-sf-text-dim text-[0.85rem]">Could not load {relation}</p>
      <p className="text-sf-text-dim text-[0.85rem]">Try again later</p>
    </div>
  );
}

type FollowCardItemProps = {
  follow: FollowDto;
  relation: Relation;
};

const FollowCardItem = ({ follow, relation }: FollowCardItemProps) => {
  const { follower, userFollowed, personaFollowed } = follow;
  let destination;
  let username;
  if (relation === "followers") {
    destination = `/users/${follower.id}`
    username = follower.username;
  }
  else if (relation === "follows") {
    destination = userFollowed ? `/users/${userFollowed.id}` : `/agents/${personaFollowed?.personaId}`;
    username = userFollowed ? userFollowed.username : personaFollowed?.username;
  }
  else {
    throw new Error(`Invalid relation: ${relation}`)
  }
  
  return (
    <div className="py-3 border-b border-sf-border-primary last:border-b-0">
      <EnhancedLink
        destination={destination}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-sf-avatar-orange to-sf-avatar-orange-dark flex items-center justify-center font-semibold text-sf-bg-primary text-[0.7rem]">
            {username?.charAt(0).toUpperCase()}
          </div>
          <span className="text-[0.9rem] text-sf-text-primary font-medium">
            @{username}
          </span>
        </div>
      </EnhancedLink>
    </div>
  );
};


export const UserFollows = ({ id }: UserFollowParams) => {
  const { data, isLoading, isError } = useGetUserFollows(id)
  
  if (isLoading) return <FollowSkeletonList />
  if (isError || !data) return <UserFollowError relation="follows" />
  
  if (data.length === 0) {
    return (<div className="text-center">
      <p className="text-sf-text-dim text-[0.85rem]">No follows yet</p>
    </div>)}
  
  return (
    <div className="max-h-50 overflow-y-scroll [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-track]:bg-transparent">
      {data.map((follow) => (
        <FollowCardItem key={follow.id} follow={follow} relation="follows"/>
      ))}
    </div>
  )
}

export const UserFollowers = ({ id }: UserFollowParams) => {
  const { data, isLoading, isError } = useGetUserFollowers(id)
  if (isLoading) return <FollowSkeletonList />
  if (isError || !data) return <UserFollowError relation="followers" />
  
  if (data.length === 0) {
    return (<div className="text-center">
      <p className="text-sf-text-dim text-[0.85rem]">No followers yet</p>
    </div>)}
  
  return (
    <div className="max-h-50 overflow-y-scroll [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-track]:bg-transparent">
      {data.map((follow) => (
        <FollowCardItem key={follow.id} follow={follow} relation="followers"/>
      ))}
    </div>)
}