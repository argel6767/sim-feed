
import { Footer } from "~/components/footer";
import { Nav, MobileGoBackNav, MobileNav } from "~/components/nav";
import { PostFeedSkeleton } from "~/components/posts";
import { FollowSkeletonList } from "~/components/user-follow";

export const UserProfileSkeleton = () => {
  return (
    <div className="bg-sf-bg-primary text-sf-text-primary min-h-screen">
      <header className="px-4 sm:px-8 py-3 sm:py-4 border-b border-sf-border-primary flex justify-between items-center bg-sf-bg-secondary sticky top-0 z-50">
        <MobileGoBackNav backTo="/feed" />
        <a
          href="/"
          className="text-[1.1rem] sm:text-[1.3rem] font-bold tracking-[2px] text-sf-text-primary"
        >
          SIM-FEED
        </a>
        <Nav />
        <MobileNav />
      </header>

      <div className="max-w-350 lg:min-w-250 mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-6 lg:p-8">
        {/* Left Sidebar Skeleton */}
        <aside className="hidden lg:flex flex-col gap-6">
          <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-4 animate-pulse">
            <div className="h-4 w-24 bg-sf-border-primary rounded mb-3" />
            <div className="space-y-2">
              <div className="h-3 bg-sf-border-primary rounded w-full" />
              <div className="h-3 bg-sf-border-primary rounded w-5/6" />
              <div className="h-3 bg-sf-border-primary rounded w-4/6" />
            </div>
          </div>
          <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-4 animate-pulse">
            <div className="h-4 w-16 bg-sf-border-primary rounded mb-3" />
            <div className="space-y-2">
              <div className="h-3 bg-sf-border-primary rounded w-full" />
              <div className="h-3 bg-sf-border-primary rounded w-3/4" />
            </div>
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex flex-col gap-6">
          {/* Profile Card Skeleton */}
          <article className="bg-sf-bg-primary border border-sf-border-primary rounded-lg p-4 sm:p-6 lg:p-8 animate-pulse">
            {/* Avatar and Username */}
            <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-sf-border-primary mb-3 sm:mb-4" />
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <div className="h-7 w-44 bg-sf-border-primary rounded" />
                <div className="h-5 w-14 bg-sf-border-primary rounded-xl" />
                <div className="h-[30px] w-[90px] bg-sf-border-primary rounded-xl" />
              </div>
            </div>

            {/* Bio Skeleton */}
            <div className="space-y-2 mb-4 sm:mb-6 px-2">
              <div className="h-4 bg-sf-border-primary rounded w-full" />
              <div className="h-4 bg-sf-border-primary rounded w-5/6" />
              <div className="h-4 bg-sf-border-primary rounded w-3/4" />
            </div>

            {/* Stats Skeleton */}
            <div className="flex justify-around border-t border-sf-border-primary pt-4 mb-4 sm:mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-6 w-10 bg-sf-border-primary rounded" />
                  <div className="h-3 w-16 bg-sf-border-primary rounded" />
                </div>
              ))}
            </div>

            {/* Joined Date Skeleton */}
            <div className="flex justify-center border-t border-sf-border-primary pt-3 sm:pt-4 mt-4 sm:mt-6">
              <div className="h-3 w-32 bg-sf-border-primary rounded" />
            </div>
          </article>

          {/* Posts Skeleton */}
          <PostFeedSkeleton count={6} />
        </main>

        {/* Right Sidebar Skeleton */}
        <aside className="hidden lg:flex flex-col gap-6">
          <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-4 animate-pulse">
            <div className="h-4 w-24 bg-sf-border-primary rounded mb-3" />
            <div className="space-y-2">
              <div className="h-3 bg-sf-border-primary rounded w-full" />
              <div className="h-3 bg-sf-border-primary rounded w-5/6" />
              <div className="h-3 bg-sf-border-primary rounded w-4/6" />
              <div className="h-3 bg-sf-border-primary rounded w-3/4" />
            </div>
          </div>
          <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-4">
            <div className="h-4 w-20 bg-sf-border-primary rounded mb-3 animate-pulse" />
            <FollowSkeletonList />
          </div>
          <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-4">
            <div className="h-4 w-20 bg-sf-border-primary rounded mb-3 animate-pulse" />
            <FollowSkeletonList />
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
};