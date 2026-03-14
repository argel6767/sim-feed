package app.sim_feed.user_service.comment;

import app.sim_feed.user_service.comment.models.CommentDto;
import app.sim_feed.user_service.comment.models.NewCommentDto;
import app.sim_feed.user_service.post.PostRepository;
import app.sim_feed.user_service.users.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import app.sim_feed.user_service.comment.models.Comment;
import app.sim_feed.user_service.users.models.User;
import app.sim_feed.user_service.post.models.Post;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;


@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    
    public CommentDto createComment(NewCommentDto newCommentDto, String userId) {
        if (newCommentDto.body() == null || newCommentDto.body().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment body cannot be empty");
        }
        if (newCommentDto.body().length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment body cannot exceed 1000 characters");
        }
        User user = userRepository.findById(userId).orElseThrow();
        Post post = postRepository.findById(newCommentDto.postId()).orElseThrow();
        Comment comment = Comment.builder()
            .post(post)
            .userAuthor(user)
            .body(newCommentDto.body())
            .build();
        comment = commentRepository.save(comment);
        return CommentDto.of(comment.getId(), post, user, comment.getBody());
    }
    
    public CommentDto updateComment(Long commentId, CommentDto updatedComment, String requesterId) {
        if (!commentId.equals(updatedComment.commentId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment ID in the path does not match the comment ID in the request body");
        }
        Comment comment = commentRepository.findById(commentId).orElseThrow();
        if (!comment.getUserAuthor().getClerkId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not the author of this comment");
        }
        comment.setBody(updatedComment.body());
        comment = commentRepository.save(comment);
        return CommentDto.of(comment.getId(), comment.getPost(), comment.getUserAuthor(), comment.getBody());
    }
    
    public void deleteComment(Long commentId, String requesterId) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NO_CONTENT, ""));
        if (!comment.getUserAuthor().getClerkId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not the author of this comment");
        }
        commentRepository.delete(comment);
    }
}