package app.sim_feed.user_service.chats;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import app.sim_feed.user_service.chats.models.Chat;
import app.sim_feed.user_service.chats.models.ChatDto;
import app.sim_feed.user_service.chats.models.ChatMember;
import app.sim_feed.user_service.chats.models.ChatsDto;
import app.sim_feed.user_service.users.UserRepository;
import lombok.RequiredArgsConstructor;
import app.sim_feed.user_service.users.models.User;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final ChatMemberRepository chatMemberRepository;
    
    @Transactional
    public ChatDto createChat(String chatName, List<String> memberIds, String creatorId) {
        if (chatName == null) {
            chatName = "New Chat by " + creatorId;
        }
        if (chatName.isEmpty() || chatName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chat name cannot be empty or blank if provided");
        }
        if (chatName.length() > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chat name cannot be longer than 50 characters");
        }
        if (memberIds == null || memberIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Member IDs cannot be empty");
        }
        memberIds.add(creatorId);
        
        Set<ChatMember> chatMembers = userRepository
            .findAllById(memberIds)
            .stream().map(
            user -> {
                ChatMember chatMember = new ChatMember();
                chatMember.setUser(user);
                return chatMember;
            }
        ).collect(Collectors.toSet());
        
        Chat chat = Chat.builder()
            .chatName(chatName)
            .members(chatMembers)
            .creatorId(creatorId)
            .build();
            
        chatMembers.forEach(chatMember -> chatMember.setChat(chat));
                
        return ChatDto.of(chatRepository.save(chat));
    }
    
    @Transactional(readOnly = true)
    public ChatsDto getUserChats(String userId) {
        Map<Boolean, List<Chat>> chatsByCreator = chatRepository.findAllByUserId(userId)
            .stream()
            .collect(Collectors.partitioningBy(chat -> chat.getCreatorId().equals(userId)));
        return ChatsDto.of(chatsByCreator.get(true), chatsByCreator.get(false));
    }
    
    public void deleteChat(Long chatId, String userId) {
        Chat chat = chatRepository.findById(chatId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));
        if (!chat.getCreatorId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this chat");
        }
        chatRepository.delete(chat);
    }
    
    public void leaveChat(Long chatId, String userId) {
        if (!chatMemberRepository.existsByChatIdAndUserClerkId(chatId, userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "You are not a member of this chat");
        }
        Chat chat = chatRepository.findById(chatId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));
        
        chat.getMembers().removeIf(member -> member.getUser() != null && member.getUser().getClerkId().equals(userId));
        chatRepository.save(chat);
    }
    
    public ChatDto kickMember(Long chatId, String targetUserId, String requesterId) {
        if (targetUserId.equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot kick yourself from the chat");
        }
        Chat chat = chatRepository.findById(chatId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));
        if (!chat.getCreatorId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to kick members from this chat");
        }
        leaveChat(chatId, targetUserId);
        return ChatDto.of(chat);
    }
    
    public ChatDto addMember(Long chatId, String targetUserId, String requesterId) {
        if (targetUserId.equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot add yourself to the chat");
        }
        Chat chat = chatRepository.findById(chatId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));
        if (!chat.getCreatorId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to add members to this chat");
        }
        
        if (chatMemberRepository.existsByChatIdAndUserClerkId(chatId, targetUserId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already a member of this chat");
        }
        
        User user = userRepository.findById(targetUserId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            
        ChatMember chatMember = new ChatMember();
        chatMember.setUser(user);
        chat.getMembers().add(chatMember);
        chatRepository.save(chat);
        return ChatDto.of(chat);
    }
    
    public ChatDto updateChatName(Long chatId, String chatName, String requesterId) {
        Chat chat = chatRepository.findById(chatId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));
        if (!chat.getCreatorId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to update this chat");
        }
        if (chatName == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chat name cannot be null");
        }
        if (chatName.isEmpty() || chatName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chat name cannot be empty or blank if provided");
        }
        if (chatName.length() > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chat name cannot be longer than 50 characters");
        }
        chat.setChatName(chatName);
        chatRepository.save(chat);
        return ChatDto.of(chat);
    }
}
