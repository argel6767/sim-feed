package app.sim_feed.user_service.messages.models;

import java.time.LocalDateTime;

import app.sim_feed.user_service.persona.models.ChatMemberPersonaDto;
import app.sim_feed.user_service.users.models.ChatMemberUserDto;

public record MessageDto (Long messageId, Long chatId, String content, ChatMemberUserDto userAuthor, ChatMemberPersonaDto personaAuthor, LocalDateTime createdAt) {
    public static MessageDto of (Message message) {
        return new MessageDto(
            message.getId(),
            message.getChat().getId(),
            message.getBody(),
            message.getUserAuthor() != null ? ChatMemberUserDto.of(message.getUserAuthor()) : null,
            message.getPersonaAuthor() != null ? ChatMemberPersonaDto.of(message.getPersonaAuthor()) : null,
            message.getCreatedAt()
        );
    }
}