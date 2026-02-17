package app.sim_feed.user_service.persona;

import org.springframework.stereotype.Service;

import app.sim_feed.user_service.persona.models.Persona;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PersonaService {

    private final PersonaRepository personaRepository;
    
    public Persona getPersonaById(Long personaId) {
        return personaRepository.findById(personaId).orElseThrow();
    }
}