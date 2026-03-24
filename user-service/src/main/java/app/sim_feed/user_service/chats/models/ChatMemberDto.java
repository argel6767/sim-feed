package app.sim_feed.user_service.chats.models;

import jakarta.annotation.Nullable;

public record ChatMemberDto(Long chatMemberId, @Nullable String userId, @Nullable Long personaId) {
    public static ChatMemberDto of(ChatMember chatMember) {
        return new ChatMemberDto(
            chatMember.getId(),
            chatMember.getUser() != null ? chatMember.getUser().getClerkId() : null,
            chatMember.getPersona() != null ? chatMember.getPersona().getPersonaId() : null
        );
    }
}