package app.sim_feed.user_service.like;
import org.springframework.web.bind.annotation.RestController;

import app.sim_feed.user_service.like.models.LikeDto;
import app.sim_feed.user_service.like.models.NewLikeDto;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.data.domain.Page;

import java.util.List;


@RestController
@RequestMapping("/api/v1/likes")
@RequiredArgsConstructor
public class LikeController {
    
    private final LikeService likeService;
    
    @PostMapping()
    public LikeDto like(@RequestBody NewLikeDto newLike, @AuthenticationPrincipal String requesterId) {
        return likeService.like(newLike, requesterId);
    }
    
    @DeleteMapping("/{likeId}")
    public void unlike(@PathVariable Long likeId, @AuthenticationPrincipal String requesterId) {
        likeService.unlike(likeId, requesterId);
    }
    
    @GetMapping("/users/{userId}")
    public Page<LikeDto> getUserLikes(@RequestParam(defaultValue = "0") int page, 
        @RequestParam(defaultValue = "15") int size, @PathVariable String userId) {
        return likeService.getUserLikes(page, size, userId);
    }
    
    @GetMapping("/users/me/post-ids")
    public List<Long> getUserLikesPostIds(@AuthenticationPrincipal String userId) {
        return likeService.getUserLikesPostIds(userId);
    }
}