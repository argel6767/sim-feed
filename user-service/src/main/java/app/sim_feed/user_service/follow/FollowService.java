package app.sim_feed.user_service.follow;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import app.sim_feed.user_service.follow.models.FollowDto;
import app.sim_feed.user_service.follow.models.FollowExistsDto;
import app.sim_feed.user_service.follow.models.NewFollowDto;
import app.sim_feed.user_service.follow.models.UserFollow;
import app.sim_feed.user_service.persona.PersonaService;
import app.sim_feed.user_service.users.UserService;
import lombok.RequiredArgsConstructor;
import java.util.List;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

@Service
@RequiredArgsConstructor
public class FollowService {
    
    private final FollowRepository followRepository;
    private final UserService userService;
    private final PersonaService personaService;
    private final CacheManager cacheManager;

    @CacheEvict(cacheNames = {"follows", "user-stats"}, key = "#requesterId")
    public FollowDto follow(NewFollowDto newFollowDto, String requesterId) {
        if (newFollowDto.userId() != null && newFollowDto.userId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requester cannot follow themselves.");
        }
        if (newFollowDto.userId() == null && newFollowDto.personaId() == null || newFollowDto.userId() != null && newFollowDto.personaId() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Either userId or personaId must be provided, not both.");
        }
        if (newFollowDto.userId() != null) {
            return followUser(newFollowDto.userId(), requesterId);
        } else {
            return followPersona(newFollowDto.personaId(), requesterId);
        }
    }

    private FollowDto followUser(String userId, String requesterId) {
        var user = userService.getUserById(userId);
        var requester = userService.getUserById(requesterId);
        var follow = UserFollow.builder()
                .follower(requester)
                .userFollowed(user)
                .build();

        FollowDto dto = FollowDto.of(followRepository.save(follow));
        
        var cache = cacheManager.getCache("followers");
        if (cache != null) {
            cache.evict(userId);
        }
        
        return dto;
    }

    private FollowDto followPersona(Long personaId, String requesterId) {
        var persona = personaService.getPersonaById(personaId);
        var requester = userService.getUserById(requesterId);
        var follow = UserFollow.builder()
                .follower(requester)
                .personaFollowed(persona)
                .build();
        return FollowDto.of(followRepository.save(follow));
    }
    
    public void deleteFollow(Long userFollowId, String requesterId) {
        var follow = followRepository.findById(userFollowId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Follow not found"));
        if (!follow.getFollower().getClerkId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Requester is not the follower");
        }
        
        String cacheKey = follow.getUserFollowed() != null
              ? "user:" + requesterId + ":" + follow.getUserFollowed().getClerkId()
              : "persona:" + requesterId + ":" + follow.getPersonaFollowed().getPersonaId();
        
        followRepository.delete(follow);
        
        var cache = cacheManager.getCache("followExists");
        if (cache != null) {
            cache.evict(cacheKey);
        }
        
        cache = cacheManager.getCache("follows");
        
        if (cache != null) {
            cache.evict(requesterId);
        }
    }
    
    @Cacheable(cacheNames = "follows", key = "#userId")
    public List<FollowDto> getAllUserFollows(String userId) {
        return followRepository.findAllByFollower_ClerkId(userId)
                .stream()
                .map(FollowDto::of)
                .toList();
    }
    
    @Cacheable(cacheNames = "followers", key = "#userId")
    public List<FollowDto> getAllUserFollowers(String userId) {
        return followRepository.findAllByUserFollowed_ClerkId(userId)
                .stream()
                .map(FollowDto::of)
                .toList();
    }
    
    @Cacheable(
      cacheNames = "followExists",
      key = "#userId != null ? 'user:' + #requesterId + ':' + #userId : 'persona:' + #requesterId + ':' + #personaId"
    )
    public FollowExistsDto isFollowing(String userId, Long personaId, String requesterId) {
        if (userId == null && personaId == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User or persona ID is required");
        if (userId != null && personaId != null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only one of user or persona ID can be provided");
        if (userId != null) {
            UserFollow follow = followRepository.findByFollower_ClerkIdAndUserFollowed_ClerkId(requesterId, userId).orElse(null);
            return new FollowExistsDto(follow != null, follow != null ? follow.getId() : null);
        }
        UserFollow follow = followRepository.findByFollower_ClerkIdAndPersonaFollowed_PersonaId(requesterId, personaId).orElse(null);
        return new FollowExistsDto(follow != null, follow != null ? follow.getId() : null);
    }
    
    public int countFollowersByUserId(String userId) {
        return followRepository.countFollowersByUserId(userId);
    }
    
    public int countFollowingByUserId(String userId) {
        return followRepository.countFollowingByUserId(userId);
    }
}
