package app.sim_feed.user_service.users;

import org.springframework.stereotype.Service;

import app.sim_feed.user_service.users.models.User;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUserById(String id) {
        return userRepository.findById(id).orElseThrow();
    }
}
