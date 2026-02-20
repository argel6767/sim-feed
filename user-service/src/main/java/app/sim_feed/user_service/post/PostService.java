package app.sim_feed.user_service.post;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import app.sim_feed.user_service.post.models.NewPostDto;
import app.sim_feed.user_service.post.models.Post;
import app.sim_feed.user_service.post.models.PostDto;
import app.sim_feed.user_service.users.UserService;
import app.sim_feed.user_service.users.models.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class PostService {

    private final PostRepository postRepository;
    private final UserService userService;

    public PostDto createPost(NewPostDto newPost, String userId) {
        if (newPost.title().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title cannot be blank");
        if (newPost.body().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Body cannot be blank");
            
        if (newPost.title().length() > 100)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title cannot be longer than 100 characters");
        if (newPost.body().length() > 1000)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Body cannot be longer than 1000 characters");
        
        User user = userService.getUserById(userId);
        
        Post post = Post.builder()
            .userAuthor(user)
            .title(newPost.title())
            .body(newPost.body())
            .build();
            
        post = postRepository.save(post);
        log.info("New post created by " + userId.substring(0,8) + "******");
        return PostDto.of(post);
    }
    
    public void deletePost(Long postId, String userId) {
        Post post = postRepository.findByIdAndUserAuthorClerkId(postId, userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "User does not own this post or post not found"));
        
        postRepository.delete(post);
    }
}