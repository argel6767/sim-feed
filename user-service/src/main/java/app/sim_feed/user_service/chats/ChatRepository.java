package app.sim_feed.user_service.chats;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import app.sim_feed.user_service.chats.models.Chat;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    
    List<Chat> findAllByCreatorId(String creatorId);
    List<Chat> findAllByMembers_User_ClerkId(String userId);
    @Query("""
        SELECT c FROM Chat c
        LEFT JOIN c.members m
        WHERE c.creatorId = :userId
        OR m.user.clerkId = :userId
    """)
    List<Chat> findAllByUserId(@Param("userId") String userId);
}