package app.sim_feed.user_service.like.models;

import jakarta.validation.constraints.NotNull;

public record NewLikeDto(@NotNull Long postId) {
}