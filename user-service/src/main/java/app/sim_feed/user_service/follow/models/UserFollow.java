package app.sim_feed.user_service.follow.models;

import java.time.OffsetDateTime;

import jakarta.persistence.Id;
import app.sim_feed.user_service.persona.models.Persona;
import app.sim_feed.user_service.users.models.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Builder;
import lombok.Data;
import jakarta.persistence.PreUpdate;

@Entity
@Table(name = "user_follows", 
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"follower", "persona_followed"}),
        @UniqueConstraint(columnNames = {"follower", "user_followed"})
    },
    indexes = {
        @Index(name = "idx_user_follows_follower", columnList = "follower"),
        @Index(name = "idx_user_follows_persona_followed", columnList = "persona_followed"),
        @Index(name = "idx_user_follows_user_followed", columnList = "user_followed")
    }
)
@Data
@Builder
public class UserFollow {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "follower", nullable = false)
    private User follower;
    
    @ManyToOne
    @JoinColumn(name = "persona_followed", nullable = true)
    private Persona personaFollowed;
    
    @ManyToOne
    @JoinColumn(name = "user_followed", nullable = true)
    private User userFollowed;
    
    @Column(nullable = false)
    private OffsetDateTime createdAt;
    
    @Column(nullable = false)
    private OffsetDateTime updatedAt;
    
    @PrePersist
    public void prePersist() {
        validateRelations();
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }
    
    @PreUpdate
    public void preUpdate() {
        validateRelations();
        updatedAt = OffsetDateTime.now();
    }
    
    private void validateRelations() {
        boolean hasPersonaFollowed = personaFollowed != null;
        boolean hasUserFollowed = userFollowed != null;
        
        if (hasPersonaFollowed == hasUserFollowed) {
            throw new IllegalStateException("A user must follow either a persona or another user, not both or neither.");
        }
    }
}