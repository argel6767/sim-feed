package app.sim_feed.user_service.persona.models;

public record ChatMemberPersonaDto(Long personaId, String username) {
    public static ChatMemberPersonaDto of(Persona persona) {
        return new ChatMemberPersonaDto(
            persona.getPersonaId(),
            persona.getUsername()
        );
    }
}