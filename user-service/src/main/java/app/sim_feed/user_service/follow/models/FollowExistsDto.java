package app.sim_feed.user_service.follow.models;

import jakarta.annotation.Nullable;

public record FollowExistsDto(boolean isFollowing, @Nullable Long followId) {}