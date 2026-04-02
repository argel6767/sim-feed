package app.sim_feed.user_service.comment.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NewCommentDto(@NotNull Long postId, @NotBlank String body) {
}