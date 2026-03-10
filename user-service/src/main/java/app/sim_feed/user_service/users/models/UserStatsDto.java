package app.sim_feed.user_service.users.models;

public record UserStatsDto(int followersCount, int followingCount, int postsCount) {
    
    public static UserStatsDto of(User user) {
        return new UserStatsDto(user.getFollowers().size(), user.getFollowing().size(), user.getPosts().size());
    }
}