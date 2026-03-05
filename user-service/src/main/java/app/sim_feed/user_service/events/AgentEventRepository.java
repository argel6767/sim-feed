package app.sim_feed.user_service.events;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgentEventRepository extends JpaRepository<Event, Long> {

	
}