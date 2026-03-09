import { useGetUserFollowers, useGetUserFollows } from "~/hooks/user-follow-stats";

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

export const UserFollows = ({ id }: UserFollowParams) => {
  const { data, isLoading, isError } = useGetUserFollows(id)
  if (isLoading) return <FollowSkeletonList />
  return (
    <div>
      Hello
    </div>
  )
}

export const UserFollowers = ({ id }: UserFollowParams) => {
  const { data, isLoading, isError } = useGetUserFollowers(id)
  if (isLoading) return <FollowSkeletonList />
  
  return (
    <FollowSkeletonList/>
  )
}