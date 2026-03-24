package app.sim_feed.user_service.chats.models;

import java.util.List;

public record ChatsDto(List<ChatDto> createdChats, List<ChatDto> joinedChats) {
    public static ChatsDto of(List<Chat> createdChats, List<Chat> joinedChats) {
        return new ChatsDto(createdChats.stream().map(ChatDto::of).toList(), joinedChats.stream().map(ChatDto::of).toList());
    }
}
