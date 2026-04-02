package app.sim_feed.user_service.chats.models;

import java.util.List;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotEmpty;

public record NewChatDto(@Nullable String chatName, @NotEmpty List<String> memberIds) {
    
}