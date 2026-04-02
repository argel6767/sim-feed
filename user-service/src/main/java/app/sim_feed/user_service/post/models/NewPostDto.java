package app.sim_feed.user_service.post.models;

import jakarta.validation.constraints.NotBlank;

public record NewPostDto(@NotBlank String title, @NotBlank String body) {
}
