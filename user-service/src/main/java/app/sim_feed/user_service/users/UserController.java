package app.sim_feed.user_service.users;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import app.sim_feed.user_service.users.models.UserDto;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PutMapping("/{id}")
    public UserDto updateUser(@PathVariable String id, @AuthenticationPrincipal String authenticatedUser, @RequestBody UserDto userDto) {
        return userService.updateUser(id, authenticatedUser, userDto);
    }
}
