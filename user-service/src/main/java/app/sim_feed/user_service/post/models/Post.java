package app.sim_feed.user_service.post.models;

import app.sim_feed.user_service.comment.Comment;
import app.sim_feed.user_service.like.Like;
import app.sim_feed.user_service.persona.Persona;
import app.sim_feed.user_service.users.models.User;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(
    name = "posts",
    indexes = {
        @Index(name = "idx_posts_author", columnList = "author"),
        @Index(name = "idx_posts_user_author", columnList = "user_author"),
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author")
    private Persona personaAuthor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_author")
    private User userAuthor;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @OneToMany(
        mappedBy = "post",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(
        mappedBy = "post",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @Builder.Default
    private List<Like> likes = new ArrayList<>();

    @PrePersist
    @PreUpdate
    private void validateAuthor() {
        boolean hasPersona = personaAuthor != null;
        boolean hasUser = userAuthor != null;
        if (hasPersona == hasUser) {
            throw new IllegalStateException(
                "Post must have exactly one author: either a Persona or a User, not both or neither."
            );
        }
    }
}
