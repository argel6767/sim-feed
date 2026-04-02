package app.sim_feed.user_service.chats;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;


import app.sim_feed.user_service.chats.models.ChatDto;
import app.sim_feed.user_service.chats.models.ChatsDto;
import app.sim_feed.user_service.chats.models.NewChatDto;
import app.sim_feed.user_service.chats.models.NewChatNameDto;
import app.sim_feed.user_service.messages.models.MessageDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import java.net.URI;
import org.springframework.http.ResponseEntity;


@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
@Validated
public class ChatController {
    private final ChatService chatService;
    
    @PostMapping
    public ResponseEntity<ChatDto> createChat(@RequestBody @Valid NewChatDto newChatDto, @AuthenticationPrincipal String userId) {
        ChatDto chatDto = chatService.createChat(newChatDto.chatName(), newChatDto.memberIds(), userId);
        URI location = URI.create("/api/v1/chats/" + chatDto.chatId());
        return ResponseEntity.created(location).body(chatDto);
    }
    
    @GetMapping
    public ChatsDto getUserChats(@AuthenticationPrincipal String userId) {
        return chatService.getUserChats(userId);
    }
    
    @GetMapping("/{chatId}/messages")
    public Page<MessageDto> getChatMessages(@PathVariable @NotNull Long chatId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size, @AuthenticationPrincipal String requesterId) {
        return chatService.getChatMessages(chatId, page, size, requesterId);
    }
    
    @DeleteMapping("/{chatId}")
    public ResponseEntity<Void> deleteChat(@PathVariable @NotNull Long chatId, @AuthenticationPrincipal String userId) {
        chatService.deleteChat(chatId, userId);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{chatId}/members")
    public ResponseEntity<Void> leaveChat(@PathVariable @NotNull Long chatId, @AuthenticationPrincipal String requesterId) {
        chatService.leaveChat(chatId, requesterId);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{chatId}/members/{targetUserId}")
    public ResponseEntity<Void> kickMember(@PathVariable @NotNull Long chatId, @PathVariable @NotBlank String targetUserId, @AuthenticationPrincipal String requesterId) {
        chatService.kickMember(chatId, targetUserId, requesterId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{chatId}/members/{targetUserId}")
    public ResponseEntity<ChatDto> addMember(@PathVariable @NotNull Long chatId, @PathVariable String targetUserId, @AuthenticationPrincipal String requesterId) {
        ChatDto chatDto = chatService.addMember(chatId, targetUserId, requesterId);
        URI location = URI.create("/api/v1/chats/" + chatDto.chatId());
        return ResponseEntity.created(location).body(chatDto);
    }
    
    @PatchMapping("/{chatId}")
    public ResponseEntity<ChatDto> updateChatName(@PathVariable @NotNull Long chatId, @RequestBody @Valid NewChatNameDto chatNameDto, @AuthenticationPrincipal String requesterId) {
        ChatDto chatDto = chatService.updateChatName(chatId, chatNameDto.chatName(), requesterId);
        URI location = URI.create("/api/v1/chats/" + chatDto.chatId());
        return ResponseEntity.created(location).body(chatDto);
    }
}