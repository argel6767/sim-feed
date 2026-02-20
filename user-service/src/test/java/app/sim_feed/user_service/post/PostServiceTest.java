package app.sim_feed.user_service.post;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import app.sim_feed.user_service.post.models.NewPostDto;
import app.sim_feed.user_service.post.models.Post;
import app.sim_feed.user_service.post.models.PostDto;
import app.sim_feed.user_service.users.UserService;
import app.sim_feed.user_service.users.models.User;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private PostService postService;

    private User testUser;
    private final String USER_ID = "clerk_user_123";

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .clerkId(USER_ID)
                .username("testuser")
                .bio("Test bio")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("createPost")
    class CreatePost {

        @Test
        @DisplayName("should create post successfully with valid input")
        void shouldCreatePostSuccessfully() {
            NewPostDto newPost = new NewPostDto("Valid Title", "Valid body content");
            Post savedPost = Post.builder()
                    .id(1L)
                    .title("Valid Title")
                    .body("Valid body content")
                    .userAuthor(testUser)
                    .createdAt(OffsetDateTime.now())
                    .build();

            when(userService.getUserById(USER_ID)).thenReturn(testUser);
            when(postRepository.save(any(Post.class))).thenReturn(savedPost);

            PostDto result = postService.createPost(newPost, USER_ID);

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(1L);
            assertThat(result.title()).isEqualTo("Valid Title");
            assertThat(result.body()).isEqualTo("Valid body content");
            assertThat(result.user()).isNotNull();
            assertThat(result.user().id()).isEqualTo(USER_ID);
            verify(userService).getUserById(USER_ID);
            verify(postRepository).save(any(Post.class));
        }

        @Test
        @DisplayName("should build post with correct user author before saving")
        void shouldBuildPostWithCorrectUserAuthor() {
            NewPostDto newPost = new NewPostDto("My Title", "My body");
            Post savedPost = Post.builder()
                    .id(1L)
                    .title("My Title")
                    .body("My body")
                    .userAuthor(testUser)
                    .createdAt(OffsetDateTime.now())
                    .build();

            when(userService.getUserById(USER_ID)).thenReturn(testUser);
            when(postRepository.save(any(Post.class))).thenReturn(savedPost);

            postService.createPost(newPost, USER_ID);

            ArgumentCaptor<Post> postCaptor = ArgumentCaptor.forClass(Post.class);
            verify(postRepository).save(postCaptor.capture());

            Post capturedPost = postCaptor.getValue();
            assertThat(capturedPost.getUserAuthor()).isEqualTo(testUser);
            assertThat(capturedPost.getTitle()).isEqualTo("My Title");
            assertThat(capturedPost.getBody()).isEqualTo("My body");
        }

        @Test
        @DisplayName("should throw BAD_REQUEST when title is blank")
        void shouldThrowWhenTitleIsBlank() {
            NewPostDto newPost = new NewPostDto("   ", "Valid body");

            assertThatThrownBy(() -> postService.createPost(newPost, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Title cannot be blank");

            verify(postRepository, never()).save(any());
            verify(userService, never()).getUserById(any());
        }

        @Test
        @DisplayName("should throw BAD_REQUEST when title is empty string")
        void shouldThrowWhenTitleIsEmpty() {
            NewPostDto newPost = new NewPostDto("", "Valid body");

            assertThatThrownBy(() -> postService.createPost(newPost, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Title cannot be blank");

            verify(postRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw BAD_REQUEST when body is blank")
        void shouldThrowWhenBodyIsBlank() {
            NewPostDto newPost = new NewPostDto("Valid Title", "   ");

            assertThatThrownBy(() -> postService.createPost(newPost, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Body cannot be blank");

            verify(postRepository, never()).save(any());
            verify(userService, never()).getUserById(any());
        }

        @Test
        @DisplayName("should throw BAD_REQUEST when body is empty string")
        void shouldThrowWhenBodyIsEmpty() {
            NewPostDto newPost = new NewPostDto("Valid Title", "");

            assertThatThrownBy(() -> postService.createPost(newPost, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Body cannot be blank");

            verify(postRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw BAD_REQUEST when title exceeds 100 characters")
        void shouldThrowWhenTitleTooLong() {
            String longTitle = "a".repeat(101);
            NewPostDto newPost = new NewPostDto(longTitle, "Valid body");

            assertThatThrownBy(() -> postService.createPost(newPost, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Title cannot be longer than 100 characters");

            verify(postRepository, never()).save(any());
            verify(userService, never()).getUserById(any());
        }

        @Test
        @DisplayName("should accept title with exactly 100 characters")
        void shouldAcceptTitleWithExactly100Characters() {
            String exactTitle = "a".repeat(100);
            NewPostDto newPost = new NewPostDto(exactTitle, "Valid body");
            Post savedPost = Post.builder()
                    .id(1L)
                    .title(exactTitle)
                    .body("Valid body")
                    .userAuthor(testUser)
                    .createdAt(OffsetDateTime.now())
                    .build();

            when(userService.getUserById(USER_ID)).thenReturn(testUser);
            when(postRepository.save(any(Post.class))).thenReturn(savedPost);

            PostDto result = postService.createPost(newPost, USER_ID);

            assertThat(result).isNotNull();
            assertThat(result.title()).isEqualTo(exactTitle);
            verify(postRepository).save(any(Post.class));
        }

        @Test
        @DisplayName("should throw BAD_REQUEST when body exceeds 1000 characters")
        void shouldThrowWhenBodyTooLong() {
            String longBody = "a".repeat(1001);
            NewPostDto newPost = new NewPostDto("Valid Title", longBody);

            assertThatThrownBy(() -> postService.createPost(newPost, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Body cannot be longer than 1000 characters");

            verify(postRepository, never()).save(any());
            verify(userService, never()).getUserById(any());
        }

        @Test
        @DisplayName("should accept body with exactly 1000 characters")
        void shouldAcceptBodyWithExactly1000Characters() {
            String exactBody = "a".repeat(1000);
            NewPostDto newPost = new NewPostDto("Valid Title", exactBody);
            Post savedPost = Post.builder()
                    .id(1L)
                    .title("Valid Title")
                    .body(exactBody)
                    .userAuthor(testUser)
                    .createdAt(OffsetDateTime.now())
                    .build();

            when(userService.getUserById(USER_ID)).thenReturn(testUser);
            when(postRepository.save(any(Post.class))).thenReturn(savedPost);

            PostDto result = postService.createPost(newPost, USER_ID);

            assertThat(result).isNotNull();
            assertThat(result.body()).isEqualTo(exactBody);
            verify(postRepository).save(any(Post.class));
        }

        @Test
        @DisplayName("should propagate exception when user is not found")
        void shouldPropagateExceptionWhenUserNotFound() {
            NewPostDto newPost = new NewPostDto("Valid Title", "Valid body");
            when(userService.getUserById(USER_ID)).thenThrow(new NoSuchElementException("No value present"));

            assertThatThrownBy(() -> postService.createPost(newPost, USER_ID))
                    .isInstanceOf(NoSuchElementException.class);

            verify(userService).getUserById(USER_ID);
            verify(postRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("deletePost")
    class DeletePost {

        @Test
        @DisplayName("should delete post successfully when user owns the post")
        void shouldDeletePostSuccessfully() {
            Long postId = 1L;
            Post existingPost = Post.builder()
                    .id(postId)
                    .title("Title")
                    .body("Body")
                    .userAuthor(testUser)
                    .createdAt(OffsetDateTime.now())
                    .build();

            when(postRepository.findByIdAndUserAuthorClerkId(postId, USER_ID))
                    .thenReturn(Optional.of(existingPost));

            postService.deletePost(postId, USER_ID);

            verify(postRepository).findByIdAndUserAuthorClerkId(postId, USER_ID);
            verify(postRepository).delete(existingPost);
        }

        @Test
        @DisplayName("should throw UNAUTHORIZED when user does not own the post")
        void shouldThrowUnauthorizedWhenUserDoesNotOwnPost() {
            Long postId = 1L;
            String differentUserId = "different_user_456";

            when(postRepository.findByIdAndUserAuthorClerkId(postId, differentUserId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> postService.deletePost(postId, differentUserId))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User does not own this post or post not found");

            verify(postRepository).findByIdAndUserAuthorClerkId(postId, differentUserId);
            verify(postRepository, never()).delete(any());
        }

        @Test
        @DisplayName("should throw UNAUTHORIZED when post does not exist")
        void shouldThrowUnauthorizedWhenPostNotFound() {
            Long nonexistentPostId = 999L;

            when(postRepository.findByIdAndUserAuthorClerkId(nonexistentPostId, USER_ID))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> postService.deletePost(nonexistentPostId, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User does not own this post or post not found");

            verify(postRepository).findByIdAndUserAuthorClerkId(nonexistentPostId, USER_ID);
            verify(postRepository, never()).delete(any());
        }
    }
}
