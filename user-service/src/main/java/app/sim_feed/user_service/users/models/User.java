package app.sim_feed.user_service.users.models;

import app.sim_feed.user_service.comment.Comment;
import app.sim_feed.user_service.follow.models.UserFollow;
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
@Table(name = "users", indexes = @Index(name = "idx_users_username", columnList = "username"))
@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class User {

    @Id
    @Column(name = "id", nullable = false, unique = true)
    private String clerkId;
    
    @Column(nullable = false, unique = true)
    private String username;

    @Column(name = "bio", length = 250)
    private String bio;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "userAuthor", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Post> posts = new ArrayList<>();

    @OneToMany(mappedBy = "userAuthor", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Like> likes = new ArrayList<>();
    
    @OneToMany(mappedBy = "follower", fetch = FetchType.LAZY)
    @Builder.Default
    private final List<UserFollow> following = new ArrayList<>();
    
    @OneToMany(mappedBy = "userFollowed", fetch = FetchType.LAZY)
    @Builder.Default
    private final List<UserFollow> followers = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
