package app.sim_feed.user_service.persona;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import app.sim_feed.user_service.persona.models.Persona;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, Long> {}