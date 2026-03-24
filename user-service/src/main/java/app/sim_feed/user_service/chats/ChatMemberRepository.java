package app.sim_feed.user_service.chats;

import org.springframework.data.jpa.repository.JpaRepository;
import app.sim_feed.user_service.chats.models.ChatMember;

public interface ChatMemberRepository extends JpaRepository<ChatMember, Long> {
    
    boolean existsByChatIdAndUserClerkId(Long chatId, String userId);
    
}