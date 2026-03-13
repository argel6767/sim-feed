// CommentEvent.java
package app.sim_feed.user_service.events.event_types;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import app.sim_feed.user_service.comment.models.Comment;
import app.sim_feed.user_service.events.Event;
import app.sim_feed.user_service.post.models.Post;

@Entity
@Table(
    name = "agent_event_comment",
    indexes = {
        @Index(
            name = "idx_agent_event_comment_post_id",
            columnList = "post_id"
        ),
        @Index(
            name = "idx_agent_event_comment_comment_id",
            columnList = "comment_id"
        ),
    },
    uniqueConstraints = {
        @UniqueConstraint(
                    name = "uq_agent_event_comment_comment_id",
                    columnNames = "comment_id"
                )
    }
)
@DiscriminatorValue("COMMENT")
@Getter
@Setter
@NoArgsConstructor
public class CommentEvent extends Event {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post parentPost;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;
}