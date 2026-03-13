package app.sim_feed.user_service.comment.models;

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
    name = "comments",
    indexes = {
        @Index(name = "idx_comments_post_id", columnList = "post_id"),
        @Index(name = "idx_comments_author_id", columnList = "author_id"),
        @Index(
            name = "idx_comments_user_author_id",
            columnList = "user_author_id"
        ),
    }
)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = true)
    private Persona personaAuthor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_author_id", nullable = true)
    private User userAuthor;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    @Column(name = "updated_at", nullable = true)
    private OffsetDateTime updatedAt;

    @PrePersist
    private void validateAuthor() {
        boolean hasPersona = personaAuthor != null;
        boolean hasUser = userAuthor != null;
        if (hasPersona == hasUser) {
            throw new IllegalStateException(
                "Comment must have exactly one author: either a Persona or a User, not both or neither."
            );
        }
    }
    
    @PreUpdate
    private void onUpdate() {
        validateAuthor();
        updatedAt = OffsetDateTime.now();
    }
}
