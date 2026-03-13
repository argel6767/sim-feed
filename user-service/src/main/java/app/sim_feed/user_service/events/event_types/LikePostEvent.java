// LikePostEvent.java
package app.sim_feed.user_service.events.event_types;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import app.sim_feed.user_service.events.Event;
import app.sim_feed.user_service.like.models.Like;

@Entity
@Table(
    name = "agent_event_like",
    indexes = {
        @Index(
            name = "idx_agent_event_like_like_id",
            columnList = "like_id"
        ),
    },
    uniqueConstraints = {
        @UniqueConstraint(
                   name = "uq_agent_event_like_like_id",
                   columnNames = "like_id"
               )
    }
)
@DiscriminatorValue("LIKE_POST")
@Getter
@Setter
@NoArgsConstructor
public class LikePostEvent extends Event {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "like_id", nullable = false)
    private Like like;
}