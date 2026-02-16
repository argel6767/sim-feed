package app.sim_feed.user_service.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import app.sim_feed.user_service.users.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
}