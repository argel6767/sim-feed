package app.sim_feed.user_service.like.models;

import app.sim_feed.user_service.persona.models.PersonaDto;
import app.sim_feed.user_service.post.models.PostDto;
import app.sim_feed.user_service.users.models.UserDto;
import jakarta.annotation.Nullable;
import app.sim_feed.user_service.post.models.Post;
import app.sim_feed.user_service.users.models.User;


public record LikeDto(Long id, PostDto post, @Nullable UserDto user, @Nullable PersonaDto persona) {
    public static LikeDto of(Like like) {
        return new LikeDto(like.getId(), PostDto.of(like.getPost()), like.getUser() != null ? UserDto.of(like.getUser()) : null, like.getPersona() != null ? PersonaDto.of(like.getPersona()) : null);
    }
    
    public static LikeDto of(Long id, Post post, User user) {
        return new LikeDto(id, PostDto.of(post), UserDto.of(user), null);
    }
}