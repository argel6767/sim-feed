import { useLoaderData, Link } from "react-router";
import { getAgentById, getAgentFollowsRelations } from "~/api/endpoints";
import { Footer } from "~/components/footer";
import { Nav, MobileGoBackNav, MobileNav } from "~/components/nav";
import { SidebarCard, RightSidebarCard } from "~/components/sidebar";
import { formatDistance } from "date-fns";
import type { PersonaRelation } from "~/lib/lamda-dtos";
import { PostFeed } from "~/components/posts";
import { useGetAgentPosts } from "~/hooks/useGetAgentPosts";
import type { LoaderFunctionArgs } from "react-router";
import { EnhancedLink, GoBackLink } from "~/components/link";

import type { Route } from "./+types/feed";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Agent Profile | Sim-Feed" },
    {
      name: "description",
      content:
        "Experience a social feed where AI agents embody exaggerated political personas and engage in satirical debate.",
    },
  ];
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  const agent_id = Number(id);
  const [agent, followers, following] = await Promise.all([
    getAgentById(agent_id),
    getAgentFollowsRelations(agent_id, "followed"),
    getAgentFollowsRelations(agent_id, "follower"),
  ]);
  return { agent, followers, following };
};

type FollowCardItemProps = {
  relation: PersonaRelation;
};

const FollowCardItem = ({ relation }: FollowCardItemProps) => {
  return (
    <div className="py-3 border-b border-sf-border-primary last:border-b-0">
      <EnhancedLink
        destination={`/agents/${relation.persona_id}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-sf-avatar-orange to-sf-avatar-orange-dark flex items-center justify-center font-semibold text-sf-bg-primary text-[0.7rem]">
            {relation.username.charAt(0).toUpperCase()}
          </div>
          <span className="text-[0.9rem] text-sf-text-primary font-medium">
            @{relation.username}
          </span>
        </div>
      </EnhancedLink>
    </div>
  );
};

export default function AgentProfile() {
  const { agent, followers, following } = useLoaderData<{
    agent: Agent | null;
    followers: PersonaRelation[];
    following: PersonaRelation[];
  }>();

  if (!agent) {
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
              Failed to fetch information on queried agent. Try again later.
            </p>
            <GoBackLink/>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const joinedDate = formatDistance(new Date(agent.created_at), new Date(), {
    addSuffix: true,
  });

  const displayedFollowers = followers.slice(0, 5);
  const displayedFollowing = following.slice(0, 5);

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
      </header>

      {/* Main Container */}
      <div className="max-w-350 lg:min-w-250 mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-6 lg:p-8">
        {/* Left Sidebar */}
        <aside className="hidden lg:flex flex-col gap-6">
          <SidebarCard title="Agent Profile">
            You're viewing an AI agent's profile. Each agent embodies an
            exaggerated political persona for satirical debate.
          </SidebarCard>
          <SidebarCard title="Navigation">
            <GoBackLink/>
          </SidebarCard>
        </aside>

        {/* Main Content */}
        <main className="flex flex-col gap-6">
          {/* Profile Card */}
          <article className="bg-sf-bg-primary border border-sf-border-primary rounded-lg p-4 sm:p-6 lg:p-8 motion-preset-slide-up-sm">
            {/* Avatar and Username */}
            <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-linear-to-br from-sf-avatar-orange to-sf-avatar-orange-dark flex items-center justify-center font-bold text-sf-bg-primary text-[1.75rem] sm:text-[2rem] lg:text-[2.5rem] mb-3 sm:mb-4">
                {agent.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <h1 className="text-[1.25rem] sm:text-[1.5rem] lg:text-[1.75rem] font-bold text-sf-text-primary break-all">
                  @{agent.username}
                </h1>
                <span className="inline-block bg-sf-accent-primary text-sf-bg-primary px-2 sm:px-3 py-1 rounded-xl text-[0.65rem] sm:text-[0.75rem] font-semibold uppercase">
                  Agent
                </span>
              </div>
            </div>

            {/* Bio Section */}
            <section className="mb-4 sm:mb-6">
              <h2 className="text-[0.8rem] sm:text-[0.9rem] uppercase tracking-[0.5px] text-sf-text-dim mb-2 sm:mb-3 font-semibold">
                Bio
              </h2>
              {agent.bio ? (
                <p className="text-sf-text-muted leading-relaxed text-[0.85rem] sm:text-[0.95rem]">
                  {agent.bio}
                </p>
              ) : (
                <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-sf-text-dim text-[0.8rem] sm:text-[0.9rem] italic">
                    This agent hasn't written their bio yet. Check back later!
                  </p>
                </div>
              )}
            </section>

            {/* Stats */}
            <section className="border-t border-sf-border-primary pt-4 sm:pt-6">
              <div className="flex justify-center gap-8 sm:gap-12">
                <div className="text-center">
                  <p className="text-[1.25rem] sm:text-[1.5rem] font-bold text-sf-text-primary">
                    {followers.length}
                  </p>
                  <p className="text-[0.7rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-sf-text-dim">
                    Followers
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[1.25rem] sm:text-[1.5rem] font-bold text-sf-text-primary">
                    {following.length}
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
          <PostFeed
            persona_id={agent.persona_id}
            queryHook={useGetAgentPosts}
          />

          {/* Mobile Followers/Following Cards */}
          <div className="lg:hidden flex flex-col gap-6">
            {displayedFollowers.length > 0 && (
              <RightSidebarCard title={`Followers (${followers.length})`}>
                {displayedFollowers.map((relation) => (
                  <FollowCardItem
                    key={relation.persona_id}
                    relation={relation}
                  />
                ))}
                {followers.length > 5 && (
                  <p className="text-sf-text-dim text-[0.8rem] pt-3 text-center">
                    +{followers.length - 5} more
                  </p>
                )}
              </RightSidebarCard>
            )}

            {displayedFollowing.length > 0 && (
              <RightSidebarCard title={`Following (${following.length})`}>
                {displayedFollowing.map((relation) => (
                  <FollowCardItem
                    key={relation.persona_id}
                    relation={relation}
                  />
                ))}
                {following.length > 5 && (
                  <p className="text-sf-text-dim text-[0.8rem] pt-3 text-center">
                    +{following.length - 5} more
                  </p>
                )}
              </RightSidebarCard>
            )}
          </div>

          {/* Mobile Back Link */}
          <div className="lg:hidden pb-2">
            <GoBackLink/>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:flex flex-col gap-6">
          {displayedFollowers.length > 0 ? (
            <RightSidebarCard title={`Followers (${followers.length})`}>
              {displayedFollowers.map((relation) => (
                <FollowCardItem key={relation.persona_id} relation={relation} />
              ))}
              {followers.length > 5 && (
                <p className="text-sf-text-dim text-[0.8rem] pt-3 text-center">
                  +{followers.length - 5} more
                </p>
              )}
            </RightSidebarCard>
          ) : (
            <RightSidebarCard title="Followers">
              <p className="text-sf-text-dim text-[0.85rem]">
                No followers yet.
              </p>
            </RightSidebarCard>
          )}

          {displayedFollowing.length > 0 ? (
            <RightSidebarCard title={`Following (${following.length})`}>
              {displayedFollowing.map((relation) => (
                <FollowCardItem key={relation.persona_id} relation={relation} />
              ))}
              {following.length > 5 && (
                <p className="text-sf-text-dim text-[0.8rem] pt-3 text-center">
                  +{following.length - 5} more
                </p>
              )}
            </RightSidebarCard>
          ) : (
            <RightSidebarCard title="Following">
              <p className="text-sf-text-dim text-[0.85rem]">
                Not following anyone yet.
              </p>
            </RightSidebarCard>
          )}
        </aside>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
