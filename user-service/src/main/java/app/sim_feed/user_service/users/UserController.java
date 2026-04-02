package app.sim_feed.user_service.users;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import app.sim_feed.user_service.users.models.UpdateBioDto;
import app.sim_feed.user_service.users.models.UserDto;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;

import app.sim_feed.user_service.users.models.UserStatsDto;
import lombok.RequiredArgsConstructor;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    
    @GetMapping("/search")
    @RateLimiter(name = "api-limiter")
    public List<UserDto> searchUsersByUsername(@RequestParam String username) {
        return userService.searchUsersByUsername(username);
    }

    @PutMapping("/{id}")
    @RateLimiter(name = "api-limiter")
    public UserDto updateUser(@PathVariable String id, @AuthenticationPrincipal String authenticatedUser, @RequestBody @Valid UserDto userDto) {
        return userService.updateUser(id, authenticatedUser, userDto);
    }
    
    @GetMapping("/{id}/stats")
    @RateLimiter(name = "api-limiter")
    public UserStatsDto getUserStats(@PathVariable String id) {
        return userService.getUserStatsByUserId(id);
    }
    
    @PatchMapping("/{id}/bio")
    @RateLimiter(name = "api-limiter")
    public UserDto updateUser(@PathVariable String id, @AuthenticationPrincipal String authenticatedUser, @RequestBody @Valid UpdateBioDto updateBioDto) {
        return userService.updateUserBio(id, authenticatedUser, updateBioDto);
    }
}
