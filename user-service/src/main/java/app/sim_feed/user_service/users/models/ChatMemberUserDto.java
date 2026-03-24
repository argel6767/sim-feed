package app.sim_feed.user_service.users.models;

import jakarta.annotation.Nullable;

public record ChatMemberUserDto(String userId, String username, @Nullable String imageUrl) {
    public static ChatMemberUserDto of(User user) {
        return new ChatMemberUserDto(
            user.getClerkId(),
            user.getUsername(),
            user.getImageUrl()
        );
    }
}