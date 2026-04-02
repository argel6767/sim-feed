package app.sim_feed.user_service.like;
import org.springframework.web.bind.annotation.RestController;

import app.sim_feed.user_service.like.models.LikeDto;
import app.sim_feed.user_service.like.models.NewLikeDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

import java.util.List;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/likes")
@RequiredArgsConstructor
@Validated
public class LikeController {
    
    private final LikeService likeService;
    
    @PostMapping()
    public ResponseEntity<LikeDto> like(@RequestBody @Valid NewLikeDto newLike, @AuthenticationPrincipal String requesterId) {
        LikeDto likeDto = likeService.like(newLike, requesterId);
        return ResponseEntity.created(URI.create("/api/v1/likes/" + likeDto.likeId())).body(likeDto);
    }
    
    @DeleteMapping("/{likeId}")
    public ResponseEntity<Void> unlike(@PathVariable @NotBlank Long likeId, @AuthenticationPrincipal String requesterId) {
        likeService.unlike(likeId, requesterId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/users/{userId}")
    public Page<LikeDto> getUserLikes(@RequestParam(defaultValue = "0") int page, 
        @RequestParam(defaultValue = "15") int size, @PathVariable @NotBlank String userId) {
        return likeService.getUserLikes(page, size, userId);
    }
    
    @GetMapping("/users/me/post-ids")
    public List<Long> getUserLikesPostIds(@AuthenticationPrincipal String userId) {
        return likeService.getUserLikesPostIds(userId);
    }
}