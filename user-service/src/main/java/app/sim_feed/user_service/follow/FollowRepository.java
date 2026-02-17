package app.sim_feed.user_service.follow;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import app.sim_feed.user_service.follow.models.UserFollow;
import java.util.List;

@Repository
public interface FollowRepository extends JpaRepository<UserFollow, Long> {

	List<UserFollow> findAllByFollower_ClerkId(String clerkId);
	List<UserFollow> findAllByUserFollowed_ClerkId(String clerkId);
}