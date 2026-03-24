package app.sim_feed.user_service.chats.models;

import app.sim_feed.user_service.persona.models.ChatMemberPersonaDto;
import app.sim_feed.user_service.users.models.ChatMemberUserDto;
import jakarta.annotation.Nullable;

public record ChatMemberDto(Long chatMemberId, @Nullable ChatMemberUserDto user, @Nullable ChatMemberPersonaDto persona) {
    public static ChatMemberDto of(ChatMember chatMember) {
        return new ChatMemberDto(
            chatMember.getId(),
            chatMember.getUser() != null ? ChatMemberUserDto.of(chatMember.getUser()) : null,
            chatMember.getPersona() != null ? ChatMemberPersonaDto.of(chatMember.getPersona()) : null
        );
    }
}