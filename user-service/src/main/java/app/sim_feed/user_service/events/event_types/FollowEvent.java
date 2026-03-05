// FollowEvent.java
package app.sim_feed.user_service.events.event_types;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import app.sim_feed.user_service.events.Event;
import app.sim_feed.user_service.persona.models.Persona;

@Entity
@Table(
    name = "agent_event_follow",
    indexes = {
        @Index(
            name = "idx_agent_event_follow_followed_id",
            columnList = "followed_id"
        ),
    }
)
@DiscriminatorValue("FOLLOW")
@Getter
@Setter
@NoArgsConstructor
public class FollowEvent extends Event {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "followed_id", nullable = false)
    private Persona personaFollowed;
}