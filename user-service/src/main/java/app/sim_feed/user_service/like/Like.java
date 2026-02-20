package app.sim_feed.user_service.like;

import app.sim_feed.user_service.persona.models.Persona;
import app.sim_feed.user_service.post.models.Post;
import app.sim_feed.user_service.users.models.User;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(
    name = "likes",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_likes_post_persona",
            columnNames = { "post_id", "persona_id" }
        ),
        @UniqueConstraint(
            name = "uq_likes_post_user",
            columnNames = { "post_id", "user_id" }
        ),
    },
    indexes = {
        @Index(name = "idx_likes_post_id", columnList = "post_id"),
        @Index(name = "idx_likes_persona_id", columnList = "persona_id"),
        @Index(name = "idx_likes_user_id", columnList = "user_id"),
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona_id")
    private Persona persona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    @PreUpdate
    private void validateAuthor() {
        boolean hasPersona = persona != null;
        boolean hasUser = user != null;
        if (hasPersona == hasUser) {
            throw new IllegalStateException(
                "A like must have exactly one author: either a Persona or a User, not both or neither."
            );
        }
    }
}
