package app.sim_feed.user_service.chats;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import app.sim_feed.user_service.chats.models.ChatNotification;
import app.sim_feed.user_service.messages.MessageService;
import app.sim_feed.user_service.messages.models.MessageDto;
import app.sim_feed.user_service.messages.models.NewMessageDto;
import lombok.RequiredArgsConstructor;


@Controller
@RequiredArgsConstructor
public class ChatWebSocket {

    private final ChatMemberRepository chatMemberRepository;
    private final MessageService messageService;

    @MessageMapping("/chats/{chatId}/join")
    @SendTo("/topic/chats/{chatId}")
    public ChatNotification joinChat(@DestinationVariable Long chatId, SimpMessageHeaderAccessor headerAccessor) {
        String userId = headerAccessor.getUser().getName();

        if (!chatMemberRepository.existsByChatIdAndUserClerkId(chatId, userId)) {
            throw new IllegalStateException("You are not a member of this chat");
        }

        return ChatNotification.join(userId, chatId);
    }
    
    @MessageMapping("/chats/{chatId}/message")
    @SendTo("/topic/chats/{chatId}")
    public ChatNotification sendMessage(@DestinationVariable Long chatId, @Payload NewMessageDto newMessageDto) {
        MessageDto messageDto = messageService.createMessage(newMessageDto);
        return ChatNotification.message(messageDto);
    }
    
    @MessageMapping("/chats/{chatId}/leave")
    @SendTo("/topic/chats/{chatId}")
    public ChatNotification leaveChat(@DestinationVariable Long chatId, SimpMessageHeaderAccessor headerAccessor) {
        String userId = headerAccessor.getUser().getName();
        return ChatNotification.leave(userId, chatId);
    }
}
