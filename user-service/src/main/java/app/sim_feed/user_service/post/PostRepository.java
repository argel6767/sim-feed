package app.sim_feed.user_service.post;

import org.springframework.stereotype.Repository;

import app.sim_feed.user_service.post.models.Post;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long>{

	Optional<Post> findByIdAndUserAuthorClerkId(Long id, String clerkId);
}