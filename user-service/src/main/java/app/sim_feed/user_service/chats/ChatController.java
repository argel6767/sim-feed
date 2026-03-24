package app.sim_feed.user_service.chats;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import app.sim_feed.user_service.chats.models.ChatDto;
import app.sim_feed.user_service.chats.models.ChatsDto;
import app.sim_feed.user_service.chats.models.NewChatDto;
import app.sim_feed.user_service.chats.models.NewChatNameDto;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    
    @PostMapping
    public ChatDto createChat(@RequestBody NewChatDto newChatDto, @AuthenticationPrincipal String userId) {
        return chatService.createChat(newChatDto.chatName(), newChatDto.memberIds(), userId);
    }
    
    @GetMapping
    public ChatsDto getUserChats(@AuthenticationPrincipal String userId) {
        return chatService.getUserChats(userId);
    }
    
    @DeleteMapping("/{chatId}")
    public void deleteChat(@PathVariable Long chatId, @AuthenticationPrincipal String userId) {
        chatService.deleteChat(chatId, userId);
    }
    
    @DeleteMapping("/{chatId}/members")
    public void leaveChat(@PathVariable Long chatId, @AuthenticationPrincipal String requesterId) {
        chatService.leaveChat(chatId, requesterId);
    }
    
    @DeleteMapping("/{chatId}/members/{targetUserId}")
    public void kickMember(@PathVariable Long chatId, @PathVariable String targetUserId, @AuthenticationPrincipal String requesterId) {
        chatService.kickMember(chatId, targetUserId, requesterId);
    }
    
    @PostMapping("/{chatId}/members/{targetUserId}")
    public ChatDto addMember(@PathVariable Long chatId, @PathVariable String targetUserId, @AuthenticationPrincipal String requesterId) {
        return chatService.addMember(chatId, targetUserId, requesterId);
    }
    
    @PatchMapping("/{chatId}")
    public ChatDto updateChatName(@PathVariable Long chatId, @RequestBody NewChatNameDto chatNameDto, @AuthenticationPrincipal String requesterId) {
        return chatService.updateChatName(chatId, chatNameDto.chatName(), requesterId);
    }
}