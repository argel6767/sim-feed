package app.sim_feed.user_service.users;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import app.sim_feed.user_service.follow.FollowRepository;
import app.sim_feed.user_service.post.PostRepository;
import app.sim_feed.user_service.users.models.User;
import app.sim_feed.user_service.users.models.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import app.sim_feed.user_service.users.models.UserStatsDto;
import app.sim_feed.user_service.users.models.UpdateBioDto;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final PostRepository postRepository;

    public User getUserById(String id) {
        return userRepository.findById(id).orElseThrow();
    }

    public UserDto updateUser(String userId, String requesterId, UserDto userDto) {
        if (!userId.equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cannot update a user's information that is not owned by the requester");
        }
        if (!userId.equals(userDto.id())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID in the request body does not match the ID in the URL");
        }
        if (userDto.bio().length() > 200) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bio length exceeds maximum allowed length");
        }
        if (userDto.username().length() > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username length must be between 3 and 50 characters");
        }
        User user = userRepository.findById(userId).orElseThrow();
        user.setUsername(userDto.username());
        user.setBio(userDto.bio());
        return UserDto.of(userRepository.save(user));
    }

    @Cacheable(cacheNames = "user-stats", key = "#userId")
    public UserStatsDto getUserStatsByUserId(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        int followersCount = followRepository.countFollowersByUserId(userId);
        int followingCount = followRepository.countFollowingByUserId(userId);
        int postsCount = postRepository.countByUserAuthor_ClerkId(userId);
        return new UserStatsDto(followersCount, followingCount, postsCount);
    }

    public UserDto updateUserBio(String userId, String requesterId, UpdateBioDto updateBioDto) {
        log.info("Updating bio for user " + userId);
        if (!userId.equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cannot update a user's information that is not owned by the requester");
        }
        if (updateBioDto.newBio() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bio cannot be null");
        }
        if (updateBioDto.newBio().length() > 200) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bio length exceeds maximum allowed length");
        }
        User user = userRepository.findById(userId).orElseThrow();
        user.setBio(updateBioDto.newBio());
        return UserDto.of(userRepository.save(user));
    }
    
    public List<UserDto> searchUsersByUsername(String query) {
        if (query == null || query.isBlank() || query.length() < 3) {
            return List.of();
        }
        
        if (query.length() > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username length is 50 characters max");
        }
        return userRepository.searchByUsername(query.trim()).stream()
            .map(UserDto::of)
            .toList();
    }
    
    @Override
    public UserDetails loadUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

}
