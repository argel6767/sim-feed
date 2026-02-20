package app.sim_feed.user_service.post;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import java.net.URI;
import java.net.URISyntaxException;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import app.sim_feed.user_service.post.models.NewPostDto;
import app.sim_feed.user_service.post.models.PostDto;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping()
    @RateLimiter(name = "api-limiter")
    public ResponseEntity<PostDto> createPost(@RequestBody NewPostDto newPost, @AuthenticationPrincipal String userId) throws URISyntaxException {
        PostDto dto = postService.createPost(newPost, userId);
        return ResponseEntity.created(new URI("/api/v1/locations/" + dto.id())).body(dto);
    }
}