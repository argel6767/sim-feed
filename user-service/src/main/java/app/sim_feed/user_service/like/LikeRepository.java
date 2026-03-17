package app.sim_feed.user_service.like;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import app.sim_feed.user_service.like.models.Like;
import app.sim_feed.user_service.users.models.User;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Page<Like> findAllByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    @Query("SELECT l FROM Like l WHERE l.post.id = :postId AND l.user.clerkId = :userId")
    Optional<Like> findByPostIdAndUserId(Long postId, String userId);
    
    @Query("SELECT l.post.id FROM Like l " +
    "WHERE l.user = :user")
    List<Long> findAllPostIdByUser(User user);
}
