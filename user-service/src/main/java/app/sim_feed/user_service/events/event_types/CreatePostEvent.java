// CreatePostEvent.java
package app.sim_feed.user_service.events.event_types;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import app.sim_feed.user_service.events.Event;
import app.sim_feed.user_service.post.models.Post;

@Entity
@Table(
    name = "agent_event_post",
    indexes = {
        @Index(
            name = "idx_agent_event_post_post_id",
            columnList = "post_id"
        ),
    },
    uniqueConstraints = {
        @UniqueConstraint(
                    name = "uq_agent_event_post_post_id",
                    columnNames = "post_id"
                )
    }
)
@DiscriminatorValue("CREATE_POST")
@Getter
@Setter
@NoArgsConstructor
public class CreatePostEvent extends Event {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
}