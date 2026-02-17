package app.sim_feed.user_service.persona.models;


public record PersonaDto(Long personaId, String username) {
    public static PersonaDto of(Persona persona) {
        return new PersonaDto(persona.getPersonaId(), persona.getUsername());
    }
}