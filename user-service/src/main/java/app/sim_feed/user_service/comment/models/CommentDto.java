package app.sim_feed.user_service.comment.models;
import app.sim_feed.user_service.post.models.Post;
import app.sim_feed.user_service.users.models.User;
import app.sim_feed.user_service.users.models.UserDto;

public record CommentDto(Long commentId, Long postId, UserDto commentAuthor, String body) {
    public static CommentDto of(Comment comment) {
        return new CommentDto(
            comment.getId(),
            comment.getPost().getId(),
            UserDto.of(comment.getUserAuthor()),
            comment.getBody()
        );
    }
    
    public static CommentDto of(Long commentId, Post post, User user, String body) {
        return new CommentDto(commentId, post.getId(), UserDto.of(user), body);
    }
}