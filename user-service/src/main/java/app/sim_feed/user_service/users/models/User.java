package app.sim_feed.user_service.users.models;

import app.sim_feed.user_service.comment.models.Comment;
import app.sim_feed.user_service.follow.models.UserFollow;
import app.sim_feed.user_service.like.models.Like;
import app.sim_feed.user_service.post.models.Author;
import app.sim_feed.user_service.post.models.Post;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

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
public class User implements Author, UserDetails{

    @Id
    @Column(name = "id", nullable = false, unique = true)
    private String clerkId;
    
    @Column(nullable = false, unique = true)
    private String username;

    @Column(name = "bio", length = 250)
    private String bio;
    
    @Column(name = "image_url", nullable = true)
    private String imageUrl;

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
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
    
    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        throw new IllegalStateException("User authencation is handled by Clerk! No passwords are stored in the database.");
    }

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
