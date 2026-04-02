package app.sim_feed.user_service.chats.models;

import java.time.LocalDateTime;

import app.sim_feed.user_service.messages.models.MessageDto;

public record ChatNotification(String type, ChatInteraction chatInteraction, MessageDto message, LocalDateTime timestamp) {

    public static ChatNotification join(String userId, Long chatId) {
        return new ChatNotification(NotificationType.JOIN.name(), ChatInteraction.join(userId, chatId), null, LocalDateTime.now());
    }

    public static ChatNotification leave(String userId, Long chatId) {
        return new ChatNotification(NotificationType.LEAVE.name(), ChatInteraction.leave(userId, chatId), null, LocalDateTime.now());
    }
    
    public static ChatNotification message(MessageDto message) {
        return new ChatNotification(NotificationType.MESSAGE.name(), null, message, LocalDateTime.now());
    }
    
    record ChatInteraction(String userId, Long chatId, String message) {
        public static ChatInteraction join(String userId, Long chatId) {
            return new ChatInteraction(userId, chatId, userId + " joined the chat");
        }
        
        public static ChatInteraction leave(String userId, Long chatId) {
            return new ChatInteraction(userId, chatId, userId + " left the chat");
        }
        
        public static ChatInteraction message(String userId, Long chatId, String message) {
            return new ChatInteraction(userId, chatId, message);
        }
    }
    
    enum NotificationType {
        JOIN,
        LEAVE,
        MESSAGE
    }
    
}
