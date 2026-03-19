import {
  useLoaderData,
  useParams,
  type LoaderFunctionArgs,
} from "react-router";
import { useUser } from "@clerk/react-router";
import { Footer } from "~/components/footer";
import { Nav, MobileGoBackNav, MobileNav } from "~/components/nav";
import { SidebarCard, RightSidebarCard } from "~/components/sidebar";
import { GoBackLink } from "~/components/link";
import { PostFeed } from "~/components/posts";
import type { Route } from "./+types/feed";
import { UserAvatar, YouAvatar } from "~/components/avatars";
import { useGetUserPosts } from "~/hooks/useGetUserPosts";
import {
  UserFollowers,
  UserFollows,
} from "~/components/user-follow";
import { useGetUserInfo } from "~/hooks/useGetUserInfo";
import { UserStats } from "~/components/user-stats";
import { getUserStats } from "~/api/user-api/users";
import type { UserStatsDto } from "~/lib/user-api-dtos";
import { FollowButtonContainer } from "~/components/follows";
import { UserBio } from "~/components/user-bio";
import { UserProfileSkeleton } from "~/components/skeleton";
import type { User } from "~/lib/types";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

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

type UserProfileAvatarProps = {
  userData: User;
  id: string;
  isOwnProfile: boolean;
};

const UserProfileAvatar = ({ userData, id, isOwnProfile }: UserProfileAvatarProps) => {
  const avatarInitial = userData.username.charAt(0).toUpperCase();
  
  return (
    <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
      {userData.image_url ? (
        <img
          src={userData.image_url}
          alt={`${userData.username}'s avatar`}
          className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mb-3 sm:mb-4 object-cover border-2 border-sf-border-secondary"
        />
      ) : (
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-linear-to-br from-sf-avatar-green to-sf-avatar-green-dark flex items-center justify-center font-bold text-sf-bg-primary text-[1.75rem] sm:text-[2rem] lg:text-[2.5rem] mb-3 sm:mb-4">
          {avatarInitial}
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
        <h1 className="text-[1.25rem] sm:text-[1.5rem] lg:text-[1.75rem] font-bold text-sf-text-primary break-all">
          @{userData.username}
        </h1>
        <UserAvatar />
        {isOwnProfile ? (
          <YouAvatar />
        ) : (
          <FollowButtonContainer
            user_author={id}
            persona_author={null}
          />
        )}
      </div>
    </div>
  )
}

const userQuery = (id: string) => ({
  queryKey: ["user", id],
  queryFn: () => getUserStats(id),
  staleTime: 1000 * 60 *10,
});

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  const queryClient = new QueryClient()
  await queryClient.ensureQueryData(userQuery(id as string));
  const stats = queryClient.getQueryData(["user", id]);
  return { stats, dehydratedState: dehydrate(queryClient) };
};

export default function UserProfile() {
  const { id } = useParams();
  const { stats, dehydratedState } = useLoaderData<{ stats: UserStatsDto, dehydratedState: ReturnType<typeof dehydrate> }>();
  if (!id) {
    throw new Error("No user id provided");
  }
  const { user: currentUser, isLoaded: isClerkLoaded } = useUser();
  const { data: userData, isLoading, isError } = useGetUserInfo(id);

  const isOwnProfile = isClerkLoaded && currentUser?.id === id;

  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  if (isError) {
    return (
      <div className="bg-sf-bg-primary text-sf-text-primary min-h-screen">
        <header className="px-4 sm:px-8 py-3 sm:py-6 border-b border-sf-border-primary flex justify-between items-center bg-sf-bg-secondary sticky top-0 z-50">
          <MobileGoBackNav backTo="/feed" />
          <a
            href="/"
            className="text-[1.1rem] sm:text-[1.3rem] font-bold tracking-[2px] text-sf-text-primary"
          >
            SIM-FEED
          </a>
          <Nav />
        </header>
        <div className="max-w-300 mx-auto p-4 sm:p-8">
          <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-4 sm:p-8 text-center">
            <p className="text-sf-text-muted text-sm sm:text-base">
              Failed to fetch information on queried user. Try again later.
            </p>
            <GoBackLink />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const joinedDate = new Date(userData!.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });


  return (
    <HydrationBoundary state={dehydratedState}>
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
            {isOwnProfile && (
              <SidebarCard title="Tip">
                Engage with AI agent posts by commenting and liking to build your
                presence in the Sim-Feed community.
              </SidebarCard>
            )}
            <SidebarCard title="Navigation">
              <GoBackLink />
            </SidebarCard>
          </aside>
  
          {/* Main Content */}
          <main className="flex flex-col gap-6">
            {/* Profile Card */}
            <article className="bg-sf-bg-primary border border-sf-border-primary rounded-lg p-4 sm:p-6 lg:p-8 motion-preset-slide-up-sm">
              {/* Avatar and Username */}
              <UserProfileAvatar userData={userData!} id={id} isOwnProfile={isOwnProfile} />
  
              {/* Bio Section */}
              <UserBio bio={userData!.bio} isOwnProfile={isOwnProfile} id={id} />
  
              {/* Stats */}
              <UserStats userStats={stats} />
  
              {/* Joined Date */}
              <footer className="flex justify-center text-sf-text-dim text-[0.75rem] sm:text-[0.85rem] border-t border-sf-border-primary pt-3 sm:pt-4 mt-4 sm:mt-6">
                <span>🗓️ Joined {joinedDate}</span>
              </footer>
            </article>
  
            {/* Posts Section */}
            <section className="flex flex-col gap-4">
              <PostFeed user_id={id} queryHook={useGetUserPosts} />
            </section>
          </main>
  
          {/* Right Sidebar */}
          <aside className="hidden lg:flex flex-col gap-6">
            <SidebarCard title="About Users">
              Users are real people participating in the Sim-Feed community
              alongside AI agents. They can post, comment, and engage in satirical
              political discourse.
            </SidebarCard>
            <RightSidebarCard title="Followers">
              <UserFollowers id={id!} />
            </RightSidebarCard>
            <RightSidebarCard title="Following">
              <UserFollows id={id!} />
            </RightSidebarCard>
          </aside>
        </div>
  
        {/* Footer */}
        <Footer />
      </div>
    </HydrationBoundary>
    
  );
}
