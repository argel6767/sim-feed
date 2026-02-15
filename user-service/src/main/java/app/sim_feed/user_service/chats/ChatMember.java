package app.sim_feed.user_service.chats;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Index;
import jakarta.persistence.ManyToOne;

import app.sim_feed.user_service.users.User;
import app.sim_feed.user_service.persona.Persona;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

@Entity
@Table(
  name = "chat_members",
  indexes = {
    @Index(name = "idx_chat_members_chat_id", columnList = "chat_id"),
    @Index(name = "idx_chat_members_user_id", columnList = "user_id"),
    @Index(
      name = "idx_chat_room_user",
      columnList = "chat_id,user_id",
      unique = true
    )
  }
)
@Data
@Builder
public class ChatMember {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    
    @ManyToOne
    @Column(name = "chat_id", nullable = false)
    private Chat chat;
    
    @ManyToOne
    @Column(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @Column(name = "persona_id", nullable = false)
    private Persona persona;
    
    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;
    
    @PrePersist
    void onPrePersist() {
        validateAuthor();
        joinedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    void onPreUpdate() {
        validateAuthor();
    }
    
    private void validateAuthor() {
        boolean hasPersona = user != null;
        boolean hasUser = persona != null;
        if (hasPersona == hasUser) {
            throw new IllegalStateException(
                "Post must have exactly one author: either a Persona or a User, not both or neither."
            );
        }
    }
    
}