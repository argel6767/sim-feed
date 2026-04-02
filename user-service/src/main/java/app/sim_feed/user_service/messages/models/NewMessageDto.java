package app.sim_feed.user_service.messages.models;

public record NewMessageDto(String content, Long chatId, String userAuthorId, Long personaAuthorId) {
    
}