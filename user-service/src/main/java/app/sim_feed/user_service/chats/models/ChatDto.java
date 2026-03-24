package app.sim_feed.user_service.chats.models;

import java.util.Set;
import java.util.stream.Collectors;

public record ChatDto(Long chatId, String chatName, String creatorId, Set<ChatMemberDto> members) {
    public static ChatDto of(Chat chat) {
        return new ChatDto(
            chat.getId(),
            chat.getChatName(),
            chat.getCreatorId(),
            chat.getMembers().stream().map(ChatMemberDto::of).collect(Collectors.toSet())
        );
    }
}