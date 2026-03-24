package app.sim_feed.user_service.chats.models;

import java.time.LocalDateTime;

public record ChatNotification(String type, String userId, Long chatId, String message, LocalDateTime timestamp) {

    public static ChatNotification join(String userId, Long chatId) {
        return new ChatNotification("JOIN", userId, chatId, userId + " joined the chat", LocalDateTime.now());
    }

    public static ChatNotification leave(String userId, Long chatId) {
        return new ChatNotification("LEAVE", userId, chatId, userId + " left the chat", LocalDateTime.now());
    }
}
