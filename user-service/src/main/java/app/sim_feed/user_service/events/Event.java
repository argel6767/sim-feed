// Event.java
package app.sim_feed.user_service.events;

import java.time.LocalDateTime;
import app.sim_feed.user_service.persona.models.Persona;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(
    name = "agent_events",
    indexes = {
        @Index(name = "idx_agent_events_persona_id", columnList = "persona_id"),
        @Index(name = "idx_agent_events_event_type", columnList = "event_type"),
        @Index(name = "idx_agent_events_created_at", columnList = "created_at DESC"),
        @Index(
            name = "idx_agent_events_persona_event",
            columnList = "persona_id, event_type"
        ),
    }
)
@DiscriminatorColumn(
    name = "event_type",
    discriminatorType = DiscriminatorType.STRING
)
@Getter
@Setter
@NoArgsConstructor
public abstract class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(nullable = false, name = "persona_id")
    private Persona persona;

    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void prePersist() {
        createdAt = LocalDateTime.now();
    }
}