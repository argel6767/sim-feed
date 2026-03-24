package app.sim_feed.user_service.chats;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import app.sim_feed.user_service.chats.models.ChatNotification;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatWebSocket {

    private final ChatMemberRepository chatMemberRepository;

    @MessageMapping("/chats/{chatId}/join")
    @SendTo("/topic/chats/{chatId}")
    public ChatNotification joinChat(@DestinationVariable Long chatId, SimpMessageHeaderAccessor headerAccessor) {
        String userId = headerAccessor.getUser().getName();

        if (!chatMemberRepository.existsByChatIdAndUserClerkId(chatId, userId)) {
            throw new IllegalStateException("You are not a member of this chat");
        }

        return ChatNotification.join(userId, chatId);
    }
}
