package app.sim_feed.user_service.comment;

import app.sim_feed.user_service.persona.Persona;
import app.sim_feed.user_service.post.Post;
import app.sim_feed.user_service.users.User;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import lombok.Data;
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
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private Persona personaAuthor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_author_id")
    private User userAuthor;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    @PreUpdate
    private void validateAuthor() {
        boolean hasPersona = personaAuthor != null;
        boolean hasUser = userAuthor != null;
        if (hasPersona == hasUser) {
            throw new IllegalStateException(
                "Comment must have exactly one author: either a Persona or a User, not both or neither."
            );
        }
    }
}
