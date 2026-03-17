package app.sim_feed.user_service.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import app.sim_feed.user_service.users.models.User;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    @NativeQuery("SELECT * FROM users WHERE username ILIKE '%' || :query || '%' ORDER BY similarity(username, :query) DESC")
    List<User> searchByUsername(@Param("query") String query);
}