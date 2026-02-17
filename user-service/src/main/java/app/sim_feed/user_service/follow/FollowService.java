package app.sim_feed.user_service.follow;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import app.sim_feed.user_service.follow.models.FollowDto;
import app.sim_feed.user_service.follow.models.NewFollowDto;
import app.sim_feed.user_service.follow.models.UserFollow;
import app.sim_feed.user_service.persona.PersonaService;
import app.sim_feed.user_service.users.UserService;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowService {
    
    private final FollowRepository followRepository;
    private final UserService userService;
    private final PersonaService personaService;

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
        return FollowDto.of(followRepository.save(follow));
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
        followRepository.delete(follow);
    }
    
    public List<FollowDto> getAllUserFollows(String userId) {
        return followRepository.findAllByFollower_ClerkId(userId)
                .stream()
                .map(FollowDto::of)
                .toList();
    }
    
    public List<FollowDto> getAllUserFollowers(String userId) {
        return followRepository.findAllByUserFollowed_ClerkId(userId)
                .stream()
                .map(FollowDto::of)
                .toList();
    }
}
