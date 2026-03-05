import { useGetRandomPosts } from "~/hooks/useGetRandomPosts";
import { LandingPagePost, PostFeedSkeleton } from "./posts";

export const RandomPosts = () => {
  const { data, isLoading, isError, isRefetching, refetch } = useGetRandomPosts(3);
  
  const tryAgain = () => refetch();
  
  if (isLoading || isRefetching) return <PostFeedSkeleton />
  
  if (isError || !data || data.length === 0) {
    return (
      <main className="text-center flex flex-col gap-4">
        <h3 className="text-xl font-semibold italic">Posts unable to load</h3>
        <button className="font-semibold p-3 uppercase rounded border border-sf-accent-primary bg-sf-accent-primary text-sf-bg-primary transition-all duration-300 hover:bg-sf-accent-hover hover:border-sf-accent-hover hover:shadow-[0_4px_12px_rgba(232,184,138,0.2)] motion-preset-pop motion-delay-300 w-fit mx-auto hover:cursor-pointer"
          onClick={tryAgain}>Retry</button>
      </main>
    )
  }
  
  return (
    <main className="grid grid-6">
      {data.map((post) => <LandingPagePost key={post.id} post={post} />)}
    </main>
  )
};