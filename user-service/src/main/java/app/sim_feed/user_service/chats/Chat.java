package app.sim_feed.user_service.chats;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;

import java.time.LocalDateTime;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.CascadeType;

@Entity
@Table(
  name = "chats",
  indexes = {
    @Index(name = "idx_chats_creator_id", columnList = "creator_id")
  }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Chat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    
    @Column(name = "chat_name", nullable = false)
    private String chatName;
    
    @Column(name = "creator_id", nullable = false)
    private String creatorId;
    
    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL)
    private Set<ChatMember> members;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
}
