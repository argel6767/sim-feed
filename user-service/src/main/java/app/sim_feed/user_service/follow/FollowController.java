package app.sim_feed.user_service.follow;

import app.sim_feed.user_service.follow.models.FollowDto;
import app.sim_feed.user_service.follow.models.NewFollowDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/follows")
@RequiredArgsConstructor
public class FollowController {
    
    private final FollowService followService;
    
    @PostMapping()
    public ResponseEntity<FollowDto> createFollow(@RequestBody NewFollowDto newFollowDto, @AuthenticationPrincipal String userId) throws URISyntaxException {
        FollowDto followDto = followService.follow(newFollowDto, userId);
        return ResponseEntity.created(new URI("/api/v1/locations/"+followDto.id())).body(followDto);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFollow(@PathVariable Long userFollowId, @AuthenticationPrincipal String userId) {
        followService.deleteFollow(userFollowId, userId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/users/{userId}/follows")
    public ResponseEntity<List<FollowDto>> getFollowsByUserId(@PathVariable String userId) {
        List<FollowDto> followDtos = followService.getAllUserFollows(userId);
        return ResponseEntity.ok(followDtos);
    }
    
    @GetMapping("/users/{userId}/followers")
    public ResponseEntity<List<FollowDto>> getFollowersByUserId(@PathVariable String userId) {
        List<FollowDto> followDtos = followService.getAllUserFollowers(userId);
        return ResponseEntity.ok(followDtos);
    }

}