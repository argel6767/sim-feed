package app.sim_feed.user_service.like;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.web.server.ResponseStatusException;

import app.sim_feed.user_service.like.models.Like;
import app.sim_feed.user_service.like.models.LikeDto;
import app.sim_feed.user_service.like.models.NewLikeDto;
import app.sim_feed.user_service.post.PostRepository;
import app.sim_feed.user_service.post.models.Post;
import app.sim_feed.user_service.users.UserRepository;
import app.sim_feed.user_service.users.models.User;

@ExtendWith(MockitoExtension.class)
class LikeServiceTest {

    @Mock
    private LikeRepository likeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private CacheManager cacheManager;

    @Mock
    private Cache cache;

    @InjectMocks
    private LikeService likeService;

    private User testUser;
    private Post testPost;

    private static final String USER_ID = "clerk_user_123";
    private static final Long POST_ID = 1L;
    private static final Long LIKE_ID = 100L;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .clerkId(USER_ID)
                .username("testuser")
                .bio("test bio")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        testPost = Post.builder()
                .id(POST_ID)
                .title("Test Post")
                .body("Test post body")
                .userAuthor(testUser)
                .build();
    }

    @Nested
    @DisplayName("like")
    class LikePost {

        @Test
        @DisplayName("should like a post successfully")
        void shouldLikePostSuccessfully() {
            NewLikeDto newLikeDto = new NewLikeDto(POST_ID, null, null);
            Like savedLike = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .user(testUser)
                    .build();

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
            when(postRepository.findById(POST_ID)).thenReturn(Optional.of(testPost));
            when(likeRepository.save(any(Like.class))).thenReturn(savedLike);
            when(cacheManager.getCache("likes")).thenReturn(cache);

            LikeDto result = likeService.like(newLikeDto, USER_ID);

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(LIKE_ID);
            assertThat(result.post().id()).isEqualTo(POST_ID);
            assertThat(result.user().id()).isEqualTo(USER_ID);
            assertThat(result.persona()).isNull();
            verify(likeRepository).save(any(Like.class));
        }

        @Test
        @DisplayName("should call userRepository and postRepository when liking a post")
        void shouldCallRepositoriesWhenLikingPost() {
            NewLikeDto newLikeDto = new NewLikeDto(POST_ID, null, null);
            Like savedLike = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .user(testUser)
                    .build();

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
            when(postRepository.findById(POST_ID)).thenReturn(Optional.of(testPost));
            when(likeRepository.save(any(Like.class))).thenReturn(savedLike);
            when(cacheManager.getCache("likes")).thenReturn(cache);

            likeService.like(newLikeDto, USER_ID);

            verify(userRepository).findById(USER_ID);
            verify(postRepository).findById(POST_ID);
        }

        @Test
        @DisplayName("should clear the user likes cache after liking a post")
        void shouldClearCacheAfterLiking() {
            NewLikeDto newLikeDto = new NewLikeDto(POST_ID, null, null);
            Like savedLike = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .user(testUser)
                    .build();

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
            when(postRepository.findById(POST_ID)).thenReturn(Optional.of(testPost));
            when(likeRepository.save(any(Like.class))).thenReturn(savedLike);
            when(cacheManager.getCache("likes")).thenReturn(cache);

            likeService.like(newLikeDto, USER_ID);

            verify(cacheManager).getCache("likes");
        }

        @Test
        @DisplayName("should throw when user not found")
        void shouldThrowWhenUserNotFound() {
            NewLikeDto newLikeDto = new NewLikeDto(POST_ID, null, null);

            when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> likeService.like(newLikeDto, USER_ID))
                    .isInstanceOf(Exception.class);

            verify(likeRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw when post not found")
        void shouldThrowWhenPostNotFound() {
            NewLikeDto newLikeDto = new NewLikeDto(POST_ID, null, null);

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
            when(postRepository.findById(POST_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> likeService.like(newLikeDto, USER_ID))
                    .isInstanceOf(Exception.class);

            verify(likeRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("unlike")
    class Unlike {

        @Test
        @DisplayName("should unlike a post successfully when requester is the like owner")
        void shouldUnlikeSuccessfully() {
            Like existingLike = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .user(testUser)
                    .build();

            when(likeRepository.findById(LIKE_ID)).thenReturn(Optional.of(existingLike));
            when(cacheManager.getCache("likes")).thenReturn(cache);

            likeService.unlike(LIKE_ID, USER_ID);

            verify(likeRepository).findById(LIKE_ID);
            verify(likeRepository).delete(existingLike);
        }

        @Test
        @DisplayName("should throw NO_CONTENT when like does not exist")
        void shouldThrowNoContentWhenLikeNotFound() {
            when(likeRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> likeService.unlike(999L, USER_ID))
                    .isInstanceOf(ResponseStatusException.class);

            verify(likeRepository).findById(999L);
            verify(likeRepository, never()).delete(any());
        }

        @Test
        @DisplayName("should throw UNAUTHORIZED when requester is not the like owner")
        void shouldThrowUnauthorizedWhenRequesterIsNotOwner() {
            User otherUser = User.builder()
                    .clerkId("clerk_other_456")
                    .username("otheruser")
                    .bio("other bio")
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();

            Like existingLike = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .user(otherUser)
                    .build();

            when(likeRepository.findById(LIKE_ID)).thenReturn(Optional.of(existingLike));

            assertThatThrownBy(() -> likeService.unlike(LIKE_ID, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User is not the author of this like");

            verify(likeRepository).findById(LIKE_ID);
            verify(likeRepository, never()).delete(any());
        }

        @Test
        @DisplayName("should clear the user likes cache after unliking a post")
        void shouldClearCacheAfterUnliking() {
            Like existingLike = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .user(testUser)
                    .build();

            when(likeRepository.findById(LIKE_ID)).thenReturn(Optional.of(existingLike));
            when(cacheManager.getCache("likes")).thenReturn(cache);

            likeService.unlike(LIKE_ID, USER_ID);

            verify(cacheManager).getCache("likes");
        }
    }

    @Nested
    @DisplayName("getUserLikes")
    class GetUserLikes {

        @Test
        @DisplayName("should return a page of likes for a user")
        void shouldReturnPageOfLikesForUser() {
            Like like1 = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .user(testUser)
                    .build();
            Like like2 = Like.builder()
                    .id(LIKE_ID + 1)
                    .post(testPost)
                    .user(testUser)
                    .build();

            Page<Like> likePage = new PageImpl<>(List.of(like1, like2));

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
            when(likeRepository.findAllByUserOrderByCreatedAtDesc(any(User.class), any(Pageable.class)))
                    .thenReturn(likePage);

            Page<LikeDto> result = likeService.getUserLikes(0, 15, USER_ID);

            assertThat(result).isNotNull();
            assertThat(result.getTotalElements()).isEqualTo(2);
            assertThat(result.getContent().get(0).id()).isEqualTo(LIKE_ID);
            assertThat(result.getContent().get(1).id()).isEqualTo(LIKE_ID + 1);
            verify(userRepository).findById(USER_ID);
            verify(likeRepository).findAllByUserOrderByCreatedAtDesc(any(User.class), any(Pageable.class));
        }

        @Test
        @DisplayName("should return empty page when user has no likes")
        void shouldReturnEmptyPageWhenUserHasNoLikes() {
            Page<Like> emptyPage = new PageImpl<>(List.of());

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
            when(likeRepository.findAllByUserOrderByCreatedAtDesc(any(User.class), any(Pageable.class)))
                    .thenReturn(emptyPage);

            Page<LikeDto> result = likeService.getUserLikes(0, 15, USER_ID);

            assertThat(result).isNotNull();
            assertThat(result.getTotalElements()).isEqualTo(0);
            assertThat(result.getContent()).isEmpty();
            verify(userRepository).findById(USER_ID);
            verify(likeRepository).findAllByUserOrderByCreatedAtDesc(any(User.class), any(Pageable.class));
        }

        @Test
        @DisplayName("should map each Like to a LikeDto with post and user")
        void shouldMapLikesToDtos() {
            Like like = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .user(testUser)
                    .build();

            Page<Like> likePage = new PageImpl<>(List.of(like));

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
            when(likeRepository.findAllByUserOrderByCreatedAtDesc(any(User.class), any(Pageable.class)))
                    .thenReturn(likePage);

            Page<LikeDto> result = likeService.getUserLikes(0, 15, USER_ID);

            LikeDto dto = result.getContent().get(0);
            assertThat(dto.id()).isEqualTo(LIKE_ID);
            assertThat(dto.post().id()).isEqualTo(POST_ID);
            assertThat(dto.user().id()).isEqualTo(USER_ID);
            assertThat(dto.persona()).isNull();
        }

        @Test
        @DisplayName("should throw when user not found")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> likeService.getUserLikes(0, 15, USER_ID))
                    .isInstanceOf(Exception.class);

            verify(likeRepository, never()).findAllByUserOrderByCreatedAtDesc(any(), any());
        }

        @Test
        @DisplayName("should use provided page and size when querying the repository")
        void shouldUseProvidedPageAndSize() {
            Page<Like> emptyPage = new PageImpl<>(List.of());

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
            when(likeRepository.findAllByUserOrderByCreatedAtDesc(any(User.class), any(Pageable.class)))
                    .thenReturn(emptyPage);

            likeService.getUserLikes(2, 5, USER_ID);

            verify(likeRepository).findAllByUserOrderByCreatedAtDesc(any(User.class), any(Pageable.class));
        }
    }
}
