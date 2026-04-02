package app.sim_feed.user_service.users.models;

import jakarta.validation.constraints.NotBlank;

public record UpdateBioDto(@NotBlank String newBio) {
}