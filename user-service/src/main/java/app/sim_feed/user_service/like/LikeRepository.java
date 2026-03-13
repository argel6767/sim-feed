package app.sim_feed.user_service.like;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import app.sim_feed.user_service.like.models.Like;
import app.sim_feed.user_service.users.models.User;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Page<Like> findAllByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
