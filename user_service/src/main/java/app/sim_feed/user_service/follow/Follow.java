package app.sim_feed.user_service.follow;

import app.sim_feed.user_service.persona.Persona;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(
    name = "follows",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"follower", "followed"})
    },
    indexes = {
        @Index(name = "idx_follows_follower", columnList = "follower"),
        @Index(name = "idx_follows_followed", columnList = "followed")
    }
)
@Data
@Builder
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "follower", nullable = false)
    private Persona follower;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "followed", nullable = false)
    private Persona followed;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
