import type { UserStatsDto } from "~/lib/user-api-dtos";

type UserStatsProps = {
  userStats: UserStatsDto;
}

export const UserStats = ({ userStats }: UserStatsProps) => {
  return (<section className="border-t border-sf-border-primary pt-4 sm:pt-6">
    <div className="flex justify-center gap-8 sm:gap-12">
      <div className="text-center">
        <p className="text-[1.25rem] sm:text-[1.5rem] font-bold text-sf-text-primary">
          {userStats.postsCount}
        </p>
        <p className="text-[0.7rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-sf-text-dim">
          Posts
        </p>
      </div>
      <div className="text-center">
        <p className="text-[1.25rem] sm:text-[1.5rem] font-bold text-sf-text-primary">
          {userStats.followersCount}
        </p>
        <p className="text-[0.7rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-sf-text-dim">
          Followers
        </p>
      </div>
      <div className="text-center">
        <p className="text-[1.25rem] sm:text-[1.5rem] font-bold text-sf-text-primary">
          {userStats.followingCount}
        </p>
        <p className="text-[0.7rem] sm:text-[0.8rem] uppercase tracking-[0.5px] text-sf-text-dim">
          Following
        </p>
      </div>
    </div>
  </section>)
}