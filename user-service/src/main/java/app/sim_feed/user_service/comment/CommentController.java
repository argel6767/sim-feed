package app.sim_feed.user_service.comment;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import app.sim_feed.user_service.comment.models.CommentDto;
import app.sim_feed.user_service.comment.models.NewCommentDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
@Validated
public class CommentController {
    
    private final CommentService commentService;
    
    @PostMapping()
    public ResponseEntity<CommentDto> createComment(@RequestBody @Valid NewCommentDto newCommentDto, @AuthenticationPrincipal String userId) {
        CommentDto dto = commentService.createComment(newCommentDto, userId);
        return ResponseEntity.created(URI.create("/api/v1/comments/" + dto.commentId())).body(dto);
    }
    
    @PutMapping("/{commentId}")
    public CommentDto updateComment(@PathVariable @NotNull Long commentId, @RequestBody @Valid CommentDto updatedComment, @AuthenticationPrincipal String userId) {
        return commentService.updateComment(commentId, updatedComment, userId);
    }
    
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable @NotNull Long commentId, @AuthenticationPrincipal String userId) {
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
    
}