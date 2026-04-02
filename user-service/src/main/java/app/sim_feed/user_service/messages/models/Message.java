package app.sim_feed.user_service.messages.models;

import app.sim_feed.user_service.chats.models.Chat;
import app.sim_feed.user_service.persona.models.Persona;
import app.sim_feed.user_service.users.models.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    
    @Column(name = "body", nullable = false, length = 1000)
    private String body;
    
    @ManyToOne()
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;
    
    @ManyToOne()
    @JoinColumn(name = "user_id", nullable = true)
    private User userAuthor;
    
    @ManyToOne()
    @JoinColumn(name = "persona_id", nullable = true)
    private Persona personaAuthor;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    void onPrePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    void onPreUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
