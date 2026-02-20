package app.sim_feed.user_service.follow.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import app.sim_feed.user_service.persona.models.Persona;

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
@NoArgsConstructor
@AllArgsConstructor
public class PersonaFollow {

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
