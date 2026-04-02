package app.sim_feed.user_service.messages;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import app.sim_feed.user_service.chats.ChatRepository;
import app.sim_feed.user_service.chats.models.Chat;
import app.sim_feed.user_service.messages.models.Message;
import app.sim_feed.user_service.messages.models.MessageDto;
import app.sim_feed.user_service.messages.models.NewMessageDto;
import app.sim_feed.user_service.users.UserRepository;
import app.sim_feed.user_service.users.models.User;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class MessageService {
    
    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;

    public Page<MessageDto> getMessagesByChatId(Long chatId, int page, int size) {
        if (page < 0 || size < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid page or size");
        }
        if (size > 200) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Size cannot exceed 200");
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return messageRepository.findAllByChat_Id(chatId, pageable)
            .map(MessageDto::of);
    }
    
    @Transactional
    public MessageDto createMessage(NewMessageDto newMessageDto) {
        Chat chat = chatRepository.findById(newMessageDto.chatId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));
        User user = userRepository.findById(newMessageDto.userAuthorId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            
        Message message = Message.builder()
            .body(newMessageDto.content())
            .chat(chat)
            .userAuthor(user)
            .build();
        
        chat.getMessages().add(message);
        chatRepository.save(chat);
        
        return MessageDto.of(message);
    }
}

