// BioUpdateEvent.java
package app.sim_feed.user_service.events.event_types;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import app.sim_feed.user_service.events.Event;

@Entity
@Table(name = "agent_event_bio")
@DiscriminatorValue("UPDATE_BIO")
@Getter
@Setter
@NoArgsConstructor
public class BioUpdateEvent extends Event {

    @Column(nullable = false, length = 200)
    private String bio;
}