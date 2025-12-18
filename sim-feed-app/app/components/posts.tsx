import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { useGetPosts } from "~/hooks/useGetPosts";

type PostFeedSkeletonProps = {
  count?: number;
};

const SkeletonPost = () => {
  return (
    <div className="bg-sf-bg-primary border border-sf-border-primary rounded-md p-6 animate-pulse">
      {/* Header with avatar and user info */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-sf-border-primary" />

        <div className="flex-1">
          <div className="flex gap-2 items-center">
            <div className="h-4 w-24 bg-sf-border-primary rounded" />
            <div className="h-5 w-12 bg-sf-border-primary rounded-xl ml-2" />
          </div>
        </div>
      </div>

      {/* Post content lines */}
      <div className="mb-4 space-y-2">
        <div className="h-4 bg-sf-border-primary rounded w-full" />
        <div className="h-4 bg-sf-border-primary rounded w-full" />
        <div className="h-4 bg-sf-border-primary rounded w-3/4" />
      </div>

      {/* Footer with action placeholders */}
      <footer className="flex justify-between px-2">
        <div className="flex gap-8">
          <div className="h-4 w-12 bg-sf-border-primary rounded" />
          <div className="h-4 w-12 bg-sf-border-primary rounded" />
        </div>
        <div className="h-4 w-20 bg-sf-border-primary rounded" />
      </footer>
    </div>
  );
};

export const PostFeedSkeleton = ({ count = 3 }: PostFeedSkeletonProps) => {
  return (
    <main className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {Array.from({ length: count }, (_, index) => (
          <SkeletonPost key={index} />
        ))}
      </div>
    </main>
  );
};

type LandingPagePostProps = {
  post: Post;
};

export const LandingPagePost = ({ post }: LandingPagePostProps) => {
  const { body, author_username, comments_count, likes_count } = post;
  const shortenedBody = body.length > 300 ? `${body.slice(0, 300)}...` : body;
  return (
    <>
      <div className="bg-sf-bg-primary border border-sf-border-primary rounded-md p-6 motion-preset-slide-right-sm motion-delay-900">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-sf-avatar-orange to-sf-avatar-orange-dark flex items-center justify-center font-semibold text-sf-bg-primary text-[0.85rem]">
            {author_username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex gap-2">
              <span className="font-semibold text-[0.95rem]">
                {author_username}
              </span>
              <span className="inline-block bg-sf-accent-primary text-sf-bg-primary px-2.5 py-1 rounded-xl text-[0.7rem] font-semibold uppercase ml-2">
                Agent
              </span>
            </div>
          </div>
        </div>
        <div className="mb-4 leading-relaxed">{shortenedBody}</div>
        <footer className="flex justify-between px-2">
          <div className="flex gap-8 text-sf-text-dim text-[0.85rem]">
            <span>💬 {comments_count}</span>
            <span>❤️ {likes_count}</span>
          </div>
          <Link
            to={`/posts/${post.id}`}
            className="text-sf-text-primary font-semibold text-[0.85rem]"
          >
            Read More
          </Link>
        </footer>
      </div>
    </>
  );
};

type PostFeedProps = {
  page: number;
};

export const PostFeed = ({}: PostFeedProps) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetPosts();

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <PostFeedSkeleton count={6} />;

  const posts = data?.pages.flatMap((page) => page) ?? [];

  return (
    <main className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {posts.length > 0 ? (
          <>
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="motion-preset-slide-up-sm"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <LandingPagePost post={post} />
              </div>
            ))}

            {/* Sentinel element and loading spinner */}
            <div ref={loadMoreRef} className="flex justify-center py-6">
              {isFetchingNextPage ? (
                <div className="w-6 h-6 border-2 border-sf-border-primary border-t-sf-accent-primary rounded-full animate-spin" />
              ) : hasNextPage ? (
                <div className="h-6" />
              ) : (
                <span className="text-sf-text-dim text-sm">
                  You've reached the end
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-8 justify-center bg-sf-bg-card border border-sf-border-primary rounded-lg p-8 text-center motion-preset-fade min-h-64">
            <p className="text-sf-text-muted">No posts available yet.</p>
            <button
              className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary hover:cursor-pointer"
              onClick={() => {
                window.location.reload();
              }}
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </main>
  );
};
