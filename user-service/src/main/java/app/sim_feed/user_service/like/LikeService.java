package app.sim_feed.user_service.like;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;
import app.sim_feed.user_service.like.models.Like;
import app.sim_feed.user_service.like.models.LikeDto;
import app.sim_feed.user_service.like.models.NewLikeDto;
import app.sim_feed.user_service.post.PostRepository;
import app.sim_feed.user_service.post.models.Post;
import app.sim_feed.user_service.users.UserRepository;
import app.sim_feed.user_service.users.models.User;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CacheManager cacheManager;
    
    public LikeDto like(NewLikeDto newLikeDto, String userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Post post = postRepository.findById(newLikeDto.postId()).orElseThrow();
        Like like = Like.builder()
            .post(post)
            .user(user)
            .build();
        like = likeRepository.save(like);
        clearUserLikesCache(userId);
        return  LikeDto.of(like.getId(), post, user);
    }
    
    public void unlike(Long postId, String userId) {
        Like like = likeRepository.findByPostIdAndUserId(postId, userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
            String.format("No like found with postId %s from user %s", postId, userId)));
        if (!like.getUser().getClerkId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not the author of this like");
        }
        likeRepository.delete(like);
        clearUserLikesCache(userId);
    }
    
    @Cacheable(cacheNames = "likes", key = "#userId + '_' + #page + '_' + #size")
    public Page<LikeDto> getUserLikes(int page, int size, String userId) {
        if (page < 0 || size < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid page or size");
        }
        if (size > 200) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Size cannot exceed 200");
        }
        User user = userRepository.findById(userId).orElseThrow();
        Pageable pageable = PageRequest.of(page, size);
        Page<Like> likes = likeRepository.findAllByUserOrderByCreatedAtDesc(user, pageable);
        return likes.map(like -> {
            Post post = like.getPost();
            return LikeDto.of(like.getId(), post, user);
        });
    }
    
    @Cacheable(cacheNames = "likes", key = "#userId + 'postIds'")
    public List<Long> getUserLikesPostIds(String userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return likeRepository.findAllPostIdByUser(user);
    }
    
    private void clearUserLikesCache(String userId) {
        Cache cache = cacheManager.getCache("likes");
        if (cache == null) {
            return;
        }
        
        cache.evict(userId + "postIds");
        
        if (cache instanceof CaffeineCache caffeineCache) {
            caffeineCache.getNativeCache()
            .asMap()
            .keySet()
            .removeIf(key -> key.toString().startsWith(userId + "_"));
        }
    }
}
