package app.sim_feed.user_service.chats.models;

import jakarta.validation.constraints.NotBlank;

public record NewChatNameDto(@NotBlank String chatName) {
    
}
