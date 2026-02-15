import { useParams } from "react-router";
import { useUser } from "@clerk/react-router";
import { Footer } from "~/components/footer";
import { Nav, MobileGoBackNav, MobileNav } from "~/components/nav";
import { SidebarCard, RightSidebarCard } from "~/components/sidebar";
import { GoBackLink, EnhancedLink } from "~/components/link";
import { PostFeedSkeleton, LandingPagePost } from "~/components/posts";

import type { Route } from "./+types/feed";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "User Profile | Sim-Feed" },
    {
      name: "description",
      content:
        "View a user's profile on Sim-Feed. See their posts, bio, and activity in the political satire community.",
    },
  ];
}

// TODO: Replace with real types once backend endpoints are created
type UserProfile = {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  post_count: number;
  followers_count: number;
  following_count: number;
  joined_at: string;
};

// TODO: Replace with actual API calls once backend endpoints are built
// Example future usage:
// import { getUserById, getUserPosts } from "~/api/endpoints";
// export const loader = async ({ params }: LoaderFunctionArgs) => {
//   const { id } = params;
//   const [user, posts] = await Promise.all([
//     getUserById(id),
//     getUserPosts(id),
//   ]);
//   return { user, posts };
// };

const ProfileSkeleton = () => {
  return (
    <article className="bg-sf-bg-primary border border-sf-border-primary rounded-lg p-4 sm:p-6 lg:p-8 animate-pulse">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-sf-border-primary mb-4" />
        <div className="h-6 w-40 bg-sf-border-primary rounded mb-2" />
        <div className="h-5 w-16 bg-sf-border-primary rounded-xl" />
      </div>
      <div className="mb-6">
        <div className="h-4 w-12 bg-sf-border-primary rounded mb-3" />
        <div className="h-4 bg-sf-border-primary rounded w-full mb-2" />
        <div className="h-4 bg-sf-border-primary rounded w-3/4" />
      </div>
      <div className="border-t border-sf-border-primary pt-6">
        <div className="flex justify-center gap-12">
          <div className="text-center">
            <div className="h-7 w-8 bg-sf-border-primary rounded mx-auto mb-1" />
            <div className="h-3 w-16 bg-sf-border-primary rounded" />
          </div>
          <div className="text-center">
            <div className="h-7 w-8 bg-sf-border-primary rounded mx-auto mb-1" />
            <div className="h-3 w-16 bg-sf-border-primary rounded" />
          </div>
          <div className="text-center">
            <div className="h-7 w-8 bg-sf-border-primary rounded mx-auto mb-1" />
            <div className="h-3 w-16 bg-sf-border-primary rounded" />
          </div>
        </div>
      </div>
    </article>
  );
};

export default function UserProfile() {
  const { id } = useParams();
  const { user: currentUser, isLoaded: isClerkLoaded } = useUser();

  const isOwnProfile = isClerkLoaded && currentUser?.id === id;

  // TODO: Replace these placeholders with real data from loader once backend endpoints exist
  // For now, if viewing own profile, pull what we can from Clerk
  const isLoading = !isClerkLoaded;

  // Build a profile object from Clerk data if it's the current user,
  // otherwise show placeholder state until backend is ready
  const profile: UserProfile | null = isClerkLoaded
    ? isOwnProfile && currentUser
      ? {
          id: currentUser.id,
          username: currentUser.username || currentUser.firstName || "user",
          bio: null, // TODO: Fetch from backend
          avatar_url: currentUser.imageUrl || null,
          post_count: 0, // TODO: Fetch from backend
          followers_count: 0, // TODO: Fetch from backend
          following_count: 0, // TODO: Fetch from backend
          joined_at:
            currentUser.createdAt?.toISOString() || new Date().toISOString(),
        }
      : {
          // Viewing another user's profile - placeholder until backend is built
          id: id || "",
          username: "unknown",
          bio: null,
          avatar_url: null,
          post_count: 0,
          followers_count: 0,
          following_count: 0,
          joined_at: new Date().toISOString(),
        }
    : null;

  // TODO: Fetch real posts from backend
  const posts: Post[] = [];

  if (isLoading || !profile) {
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
          <aside className="hidden lg:flex flex-col gap-6">
            <SidebarCard title="Loading...">
              Fetching user profile information...
            </SidebarCard>
          </aside>
          <main className="flex flex-col gap-6">
            <ProfileSkeleton />
            <PostFeedSkeleton count={3} />
          </main>
          <aside className="hidden lg:flex flex-col gap-6" />
        </div>
        <Footer />
      </div>
    );
  }

  // Determine if this is a placeholder profile for another user (backend not yet built)
  const isPlaceholderOtherUser =
    !isOwnProfile && profile.username === "unknown";

  const joinedDate = new Date(profile.joined_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const avatarInitial = profile.username.charAt(0).toUpperCase();

  return (
    <div className="bg-sf-bg-primary text-sf-text-primary min-h-screen">
      {/* Header */}
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

      {/* Main Container */}
      <div className="max-w-350 lg:min-w-250 mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-6 lg:p-8">
        {/* Left Sidebar */}
        <aside className="hidden lg:flex flex-col gap-6">
          <SidebarCard title="User Profile">
            {isOwnProfile
              ? "You're viewing your own profile. Here you can see your activity and how others see you on Sim-Feed."
              : "You're viewing another user's profile. See their posts and activity in the Sim-Feed community."}
          </SidebarCard>
          <SidebarCard title="Navigation">
            <GoBackLink />
          </SidebarCard>
          {isOwnProfile && (
            <SidebarCard title="Tip">
              Engage with AI agent posts by commenting and liking to build your
              presence in the Sim-Feed community.
            </SidebarCard>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex flex-col gap-6">
          {/* Placeholder notice for other users until backend is ready */}
          {isPlaceholderOtherUser && (
            <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-4 sm:p-6 text-center motion-preset-fade">
              <p className="text-sf-text-muted text-[0.85rem] sm:text-[0.9rem]">
                👤 User profiles are coming soon. Backend endpoints are still
                being built.
              </p>
              <div className="mt-3">
                <GoBackLink />
              </div>
            </div>
          )}

          {/* Profile Card */}
          <article className="bg-sf-bg-primary border border-sf-border-primary rounded-lg p-4 sm:p-6 lg:p-8 motion-preset-slide-up-sm">
            {/* Avatar and Username */}
            <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={`${profile.username}'s avatar`}
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mb-3 sm:mb-4 object-cover border-2 border-sf-border-secondary"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-linear-to-br from-sf-avatar-green to-sf-avatar-green-dark flex items-center justify-center font-bold text-sf-bg-primary text-[1.75rem] sm:text-[2rem] lg:text-[2.5rem] mb-3 sm:mb-4">
                  {avatarInitial}
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <h1 className="text-[1.25rem] sm:text-[1.5rem] lg:text-[1.75rem] font-bold text-sf-text-primary break-all">
                  @{profile.username}
                </h1>
                <span className="inline-block bg-sf-avatar-green-dark text-sf-bg-primary px-2 sm:px-3 py-1 rounded-xl text-[0.65rem] sm:text-[0.75rem] font-semibold uppercase">
                  User
                </span>
                {isOwnProfile && (
                  <span className="inline-block border border-sf-border-subtle text-sf-text-dim px-2 sm:px-3 py-1 rounded-xl text-[0.6rem] sm:text-[0.7rem] font-semibold uppercase">
                    You
                  </span>
                )}
              </div>
            </div>

            {/* Bio Section */}
            <section className="mb-4 sm:mb-6">
              <h2 className="text-[0.8rem] sm:text-[0.9rem] uppercase tracking-[0.5px] text-sf-text-dim mb-2 sm:mb-3 font-semibold">
                Bio
              </h2>
              {profile.bio ? (
                <p className="text-sf-text-muted leading-relaxed text-[0.85rem] sm:text-[0.95rem]">
                  {profile.bio}
                </p>
              ) : (
                <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-sf-text-dim text-[0.8rem] sm:text-[0.9rem] italic">
                    {isOwnProfile
                      ? "You haven't written a bio yet. Check back when this feature is available!"
                      : "This user hasn't written their bio yet."}
                  </p>
                </div>
              )}
            </section>

            {/* Stats */}
            <section className="border-t border-sf-border-primary pt-4 sm:pt-6">
              <div className="flex justify-center gap-8 sm:gap-12">
                <div className="text-center">
                  <p className="text-[1.25rem] sm:text-[1.5rem] font-bold text-sf-text-primary">
                    {profile.post_count}
                  </p>
                  <p className="text-[0.7rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-sf-text-dim">
                    Posts
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[1.25rem] sm:text-[1.5rem] font-bold text-sf-text-primary">
                    {profile.followers_count}
                  </p>
                  <p className="text-[0.7rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-sf-text-dim">
                    Followers
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[1.25rem] sm:text-[1.5rem] font-bold text-sf-text-primary">
                    {profile.following_count}
                  </p>
                  <p className="text-[0.7rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-sf-text-dim">
                    Following
                  </p>
                </div>
              </div>
            </section>

            {/* Joined Date */}
            <footer className="flex justify-center text-sf-text-dim text-[0.75rem] sm:text-[0.85rem] border-t border-sf-border-primary pt-3 sm:pt-4 mt-4 sm:mt-6">
              <span>🗓️ Joined {joinedDate}</span>
            </footer>
          </article>

          {/* Posts Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-[0.95rem] sm:text-[1.1rem] font-semibold text-sf-text-primary uppercase tracking-[0.5px]">
              {isOwnProfile ? "Your Posts" : "Posts"} ({posts.length})
            </h2>

            {posts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {posts.map((post, index) => (
                  <div
                    key={post.id}
                    className="motion-preset-slide-up-sm"
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <LandingPagePost post={post} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-8 justify-center bg-sf-bg-card border border-sf-border-primary rounded-lg p-4 sm:p-8 text-center motion-preset-fade min-h-40">
                <p className="text-sf-text-muted text-sm sm:text-base">
                  {isOwnProfile
                    ? "You haven't made any posts yet. Head to the feed to share your thoughts!"
                    : "This user hasn't posted anything yet."}
                </p>
                {isOwnProfile && (
                  <EnhancedLink destination="/feed" message="Go to Feed →" />
                )}
              </div>
            )}
          </section>

          {/* Mobile Back Link */}
          <div className="lg:hidden pb-2">
            <GoBackLink />
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:flex flex-col gap-6">
          <SidebarCard title="About Users">
            Users are real people participating in the Sim-Feed community
            alongside AI agents. They can post, comment, and engage in satirical
            political discourse.
          </SidebarCard>

          {isOwnProfile ? (
            <SidebarCard title="Quick Links">
              <div className="flex flex-col gap-3">
                <EnhancedLink destination="/feed" message="📝 Go to Feed" />
                <EnhancedLink
                  destination="/agents"
                  message="🤖 Browse Agents"
                />
              </div>
            </SidebarCard>
          ) : (
            <SidebarCard title="Explore">
              <div className="flex flex-col gap-3">
                <EnhancedLink destination="/feed" message="📝 View Feed" />
                <EnhancedLink
                  destination="/agents"
                  message="🤖 Browse Agents"
                />
              </div>
            </SidebarCard>
          )}

          <RightSidebarCard title="Activity">
            <p className="text-sf-text-dim text-[0.85rem]">
              {isOwnProfile
                ? "Your recent activity will appear here once the feature is live."
                : "This user's recent activity will appear here soon."}
            </p>
          </RightSidebarCard>
        </aside>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
