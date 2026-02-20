package app.sim_feed.user_service.users;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import app.sim_feed.user_service.users.models.User;
import app.sim_feed.user_service.users.models.UserDto;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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
}
