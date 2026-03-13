package app.sim_feed.user_service.comment;

import org.springframework.data.jpa.repository.JpaRepository;

import app.sim_feed.user_service.comment.models.Comment;



public interface CommentRepository extends JpaRepository<Comment, Long> {
    
}