package app.sim_feed.user_service.like.models;

import jakarta.annotation.Nullable;

public record NewLikeDto(Long postId, @Nullable Long personaId, @Nullable String userId) {
}