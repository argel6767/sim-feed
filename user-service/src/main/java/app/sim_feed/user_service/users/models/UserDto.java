package app.sim_feed.user_service.users.models;

public record UserDto(String id, String username, String bio) {
    
    public static UserDto of(User user) {
        return new UserDto(
            user.getClerkId(),
            user.getUsername(),
            user.getBio()
        );
    }
}
