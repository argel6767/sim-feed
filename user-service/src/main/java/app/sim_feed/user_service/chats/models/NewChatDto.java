package app.sim_feed.user_service.chats.models;

import java.util.List;

import jakarta.annotation.Nullable;

public record NewChatDto(@Nullable String chatName, List<String> memberIds) {
    
}