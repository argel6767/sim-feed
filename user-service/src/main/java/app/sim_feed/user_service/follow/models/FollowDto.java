package app.sim_feed.user_service.follow.models;

import app.sim_feed.user_service.users.models.UserDto;
import jakarta.annotation.Nullable;
import app.sim_feed.user_service.persona.models.PersonaDto;

public record FollowDto(Long id, UserDto follower, @Nullable UserDto userFollowed, @Nullable PersonaDto personaFollowed) {
    
    public static FollowDto of(UserFollow userFollow) {
        if (userFollow.getUserFollowed() == null) {
            return new FollowDto(userFollow.getId(), UserDto.of(userFollow.getFollower()), null, PersonaDto.of(userFollow.getPersonaFollowed()));
        }
        return new FollowDto(userFollow.getId(), UserDto.of(userFollow.getFollower()),UserDto.of(userFollow.getUserFollowed()), null);
    }
}