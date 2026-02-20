package app.sim_feed.user_service.post.models;

import app.sim_feed.user_service.users.models.UserDto;

public record PostDto(UserDto user, Long id, String title, String body) {
    
    public static PostDto of(Post post) {
        return new PostDto(
            UserDto.of(post.getUserAuthor()),
            post.getId(),
            post.getTitle(),
            post.getBody()
        );
    }
}