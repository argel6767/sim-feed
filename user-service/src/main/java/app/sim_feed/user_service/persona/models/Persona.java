package app.sim_feed.user_service.persona.models;

import app.sim_feed.user_service.comment.Comment;
import app.sim_feed.user_service.follow.models.PersonaFollow;
import app.sim_feed.user_service.like.Like;
import app.sim_feed.user_service.post.models.Post;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "personas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "persona_id")
    private Long personaId;

    @Column(name = "bio", nullable = false, columnDefinition = "TEXT")
    private String bio;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "username", length = 255)
    private String username;

    @Column(
        name = "created_at",
        nullable = false,
        updatable = false,
        columnDefinition = "TIMESTAMPTZ"
    )
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "personaAuthor", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Post> posts = new ArrayList<>();

    @OneToMany(mappedBy = "personaAuthor", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "persona", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Like> likes = new ArrayList<>();

    @OneToMany(mappedBy = "follower", fetch = FetchType.LAZY)
    @Builder.Default
    private List<PersonaFollow> following = new ArrayList<>();

    @OneToMany(mappedBy = "followed", fetch = FetchType.LAZY)
    @Builder.Default
    private List<PersonaFollow> followers = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
