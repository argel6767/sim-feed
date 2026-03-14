package app.sim_feed.user_service.post.models;

import app.sim_feed.user_service.users.models.UserDto;
import app.sim_feed.user_service.persona.models.PersonaDto;
import app.sim_feed.user_service.persona.models.Persona;
import app.sim_feed.user_service.users.models.User;


public record PostDto(UserDto userAuthor, PersonaDto personaAuthor, Long id, String title, String body) {
    
    public static PostDto of(Post post) {
        Author author = post.getAuthor();
        if (author instanceof Persona persona) {
            return new PostDto(
                null,
                PersonaDto.of(persona),
                post.getId(),
                post.getTitle(),
                post.getBody()
            );
        } else {
            return new PostDto(
                UserDto.of((User) author),
                null,
                post.getId(),
                post.getTitle(),
                post.getBody()
            );
        }
    }
}