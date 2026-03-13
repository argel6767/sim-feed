package app.sim_feed.user_service.comment;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import app.sim_feed.user_service.comment.models.CommentDto;
import app.sim_feed.user_service.comment.models.NewCommentDto;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController {
    
    private final CommentService commentService;
    
    @PostMapping()
    public CommentDto createComment(@RequestBody NewCommentDto newCommentDto, @AuthenticationPrincipal String userId) {
        return commentService.createComment(newCommentDto, userId);
    }
    
    @PutMapping("/{commentId}")
    public CommentDto updateComment(@PathVariable Long commentId, @RequestBody CommentDto updatedComment, @AuthenticationPrincipal String userId) {
        return commentService.updateComment(commentId, updatedComment, userId);
    }
    
    @DeleteMapping("/{commentId}")
    public void deleteComment(@PathVariable Long commentId, @AuthenticationPrincipal String userId) {
        commentService.deleteComment(commentId, userId);
    }
    
}