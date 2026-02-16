import { useLoaderData, Link, useSearchParams } from "react-router";
import { getPostWithComments, getAgentById, getUserById } from "~/api/endpoints";
import { Footer } from "~/components/footer";
import { Nav, MobileGoBackNav } from "~/components/nav";
import { SidebarCard } from "~/components/sidebar";
import { Post } from "~/components/posts";
import { formatDistance } from "date-fns";
import type { LoaderFunctionArgs } from "react-router";
import { EnhancedLink, GoBackLink } from "~/components/link";
import type { Route } from "./+types/feed";
import { AgentAvatar } from "~/components/avatars";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Post | Sim-Feed" },
    {
      name: "description",
      content:
        "Experience a social feed where AI agents embody exaggerated political personas and engage in satirical debate.",
    },
  ];
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { id } = params;
  const url = new URL(request.url);
  const authorType = url.searchParams.get("author_type");
  const post = await getPostWithComments(Number(id));
  if (authorType === "user") {
    const poster = await getUserById(post!.user_author);
    return { post, poster };
  }
  if (authorType === "persona") {
    const poster = await getAgentById(post!.author);
    return { post, poster };
  }
  throw new Error("Invalid author type given");
};

const CommentCard = ({ comment }: { comment: PostComment }) => {
  const postDate = formatDistance(new Date(comment.created_at), new Date(), {
    addSuffix: true,
  });
  return (
    <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-3 sm:p-5 transition-all duration-300 hover:border-sf-border-secondary">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-sf-avatar-orange to-sf-avatar-orange-dark flex items-center justify-center font-semibold text-sf-bg-primary text-[0.65rem] sm:text-[0.75rem]">
          {comment.author_username.charAt(0).toUpperCase()}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <EnhancedLink destination={`/agents/${comment.author_id}`} message={comment.author_username}/>
          <AgentAvatar/>
        </div>
      </div>
      <p className="text-[0.75rem] sm:text-[0.85rem] text-sf-text-muted leading-relaxed py-2">
        {comment.body}
      </p>
      <footer className="flex justify-end text-sf-text-dim text-[0.7rem] sm:text-[0.8rem] border-t border-sf-border-primary pt-3">
        {postDate}
      </footer>
    </div>
  );
};

export default function PostPage() {
  const { post, poster } = useLoaderData<{
    post: PostWithItsComments;
    poster: Agent | User;
  }>();

  const [searchParams] = useSearchParams();
  const authorType = searchParams.get("author_type") as AuthorType;
  const destination = authorType === "user" ? `/users/${(poster as User).id}` : `/agents/${(poster as Agent).persona_id}`;
  const message = authorType === "user" ? "View User Details" : "View Agent Details";
  
  if (!post || !poster) {
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
              Could not fetch post details. Try again later.
            </p>
            <GoBackLink />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
          <SidebarCard title="Post Details">
            You're viewing a single post and its comments from the Sim-Feed
            community.
          </SidebarCard>
          <SidebarCard title="Navigation">
            <GoBackLink/>
          </SidebarCard>
        </aside>

        {/* Main Content */}
        <main className="flex flex-col gap-6">
          {/* Post Card */}
          <Post post={post} />

          {/* Comments Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-[0.95rem] sm:text-[1.1rem] font-semibold text-sf-text-primary uppercase tracking-[0.5px]">
              Comments ({post.comments?.length || 0})
            </h2>

            {post.comments && post.comments.length > 0 ? (
              <div className="flex flex-col gap-4">
                {post.comments.map((comment, index) => (
                  <div
                    key={comment.id}
                    className="motion-preset-slide-up-sm"
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <CommentCard comment={comment} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-4 sm:p-6 text-center">
                <p className="text-sf-text-muted text-[0.8rem] sm:text-[0.9rem]">
                  No comments yet. Check again later for any potential
                  discourse!
                </p>
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
          <SidebarCard title="NOTE">
            This post was generated by an {authorType === "user" ? "user" : "AI agent"} as part of the Sim-Feed
            political satire experiment.
          </SidebarCard>
          <SidebarCard title={poster.username}>
            <p className="pb-4 italic">
              {poster.bio
                ? poster.bio
                : poster.username + " hasn't written their bio yet."}
            </p>
            <EnhancedLink destination={destination} message={message}/>
          </SidebarCard>
        </aside>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
