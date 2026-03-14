package app.sim_feed.user_service.comment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import app.sim_feed.user_service.comment.models.Comment;
import app.sim_feed.user_service.comment.models.CommentDto;
import app.sim_feed.user_service.comment.models.NewCommentDto;
import app.sim_feed.user_service.post.PostRepository;
import app.sim_feed.user_service.post.models.Post;
import app.sim_feed.user_service.users.UserRepository;
import app.sim_feed.user_service.users.models.User;
import app.sim_feed.user_service.users.models.UserDto;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private CommentService commentService;

    private User testUser;
    private Post testPost;

    private static final String USER_ID = "clerk_user_123";
    private static final Long POST_ID = 1L;
    private static final Long COMMENT_ID = 10L;

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
    @DisplayName("createComment")
    class CreateComment {

        @Test
        @DisplayName("should create a comment successfully")
        void shouldCreateCommentSuccessfully() {
            NewCommentDto newCommentDto = new NewCommentDto(POST_ID, "This is a comment");
            Comment savedComment = Comment.builder()
                    .id(COMMENT_ID)
                    .post(testPost)
                    .userAuthor(testUser)
                    .body("This is a comment")
                    .build();

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
            when(postRepository.findById(POST_ID)).thenReturn(Optional.of(testPost));
            when(commentRepository.save(any(Comment.class))).thenReturn(savedComment);

            CommentDto result = commentService.createComment(newCommentDto, USER_ID);

            assertThat(result).isNotNull();
            assertThat(result.commentId()).isEqualTo(COMMENT_ID);
            assertThat(result.postId()).isEqualTo(POST_ID);
            assertThat(result.commentAuthor().id()).isEqualTo(USER_ID);
            assertThat(result.body()).isEqualTo("This is a comment");
            verify(commentRepository).save(any(Comment.class));
        }

        @Test
        @DisplayName("should throw BAD_REQUEST when comment body is null")
        void shouldThrowBadRequestWhenBodyIsNull() {
            NewCommentDto newCommentDto = new NewCommentDto(POST_ID, null);

            assertThatThrownBy(() -> commentService.createComment(newCommentDto, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Comment body cannot be empty");

            verify(commentRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw BAD_REQUEST when comment body is blank")
        void shouldThrowBadRequestWhenBodyIsBlank() {
            NewCommentDto newCommentDto = new NewCommentDto(POST_ID, "   ");

            assertThatThrownBy(() -> commentService.createComment(newCommentDto, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Comment body cannot be empty");

            verify(commentRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw BAD_REQUEST when comment body exceeds 1000 characters")
        void shouldThrowBadRequestWhenBodyTooLong() {
            String longBody = "a".repeat(1001);
            NewCommentDto newCommentDto = new NewCommentDto(POST_ID, longBody);

            assertThatThrownBy(() -> commentService.createComment(newCommentDto, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Comment body cannot exceed 1000 characters");

            verify(commentRepository, never()).save(any());
        }

        @Test
        @DisplayName("should accept comment body with exactly 1000 characters")
        void shouldAcceptBodyWithExactly1000Characters() {
            String exactBody = "a".repeat(1000);
            NewCommentDto newCommentDto = new NewCommentDto(POST_ID, exactBody);
            Comment savedComment = Comment.builder()
                    .id(COMMENT_ID)
                    .post(testPost)
                    .userAuthor(testUser)
                    .body(exactBody)
                    .build();

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
            when(postRepository.findById(POST_ID)).thenReturn(Optional.of(testPost));
            when(commentRepository.save(any(Comment.class))).thenReturn(savedComment);

            CommentDto result = commentService.createComment(newCommentDto, USER_ID);

            assertThat(result).isNotNull();
            verify(commentRepository).save(any(Comment.class));
        }

        @Test
        @DisplayName("should call userRepository and postRepository when creating a comment")
        void shouldCallRepositoriesWhenCreatingComment() {
            NewCommentDto newCommentDto = new NewCommentDto(POST_ID, "Valid comment body");
            Comment savedComment = Comment.builder()
                    .id(COMMENT_ID)
                    .post(testPost)
                    .userAuthor(testUser)
                    .body("Valid comment body")
                    .build();

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
            when(postRepository.findById(POST_ID)).thenReturn(Optional.of(testPost));
            when(commentRepository.save(any(Comment.class))).thenReturn(savedComment);

            commentService.createComment(newCommentDto, USER_ID);

            verify(userRepository).findById(USER_ID);
            verify(postRepository).findById(POST_ID);
        }
    }

    @Nested
    @DisplayName("updateComment")
    class UpdateComment {

        @Test
        @DisplayName("should update comment successfully when requester is the author")
        void shouldUpdateCommentSuccessfully() {
            Comment existingComment = Comment.builder()
                    .id(COMMENT_ID)
                    .post(testPost)
                    .userAuthor(testUser)
                    .body("Original body")
                    .build();
            CommentDto updatedCommentDto = new CommentDto(
                    COMMENT_ID, POST_ID,
                    new UserDto(USER_ID, "testuser", "test bio", "image.com"),
                    "Updated body"
            );

            when(commentRepository.findById(COMMENT_ID)).thenReturn(Optional.of(existingComment));
            when(commentRepository.save(any(Comment.class))).thenReturn(existingComment);

            CommentDto result = commentService.updateComment(COMMENT_ID, updatedCommentDto, USER_ID);

            assertThat(result).isNotNull();
            assertThat(result.commentId()).isEqualTo(COMMENT_ID);
            verify(commentRepository).findById(COMMENT_ID);
            verify(commentRepository).save(any(Comment.class));
        }

        @Test
        @DisplayName("should throw BAD_REQUEST when commentId in path mismatches the body")
        void shouldThrowBadRequestWhenCommentIdMismatch() {
            CommentDto mismatchedCommentDto = new CommentDto(
                    999L, POST_ID,
                    new UserDto(USER_ID, "testuser", "test bio", "image.com"),
                    "Some body"
            );

            assertThatThrownBy(() -> commentService.updateComment(COMMENT_ID, mismatchedCommentDto, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Comment ID in the path does not match the comment ID in the request body");

            verify(commentRepository, never()).findById(any());
            verify(commentRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw UNAUTHORIZED when requester is not the comment author")
        void shouldThrowUnauthorizedWhenRequesterIsNotAuthor() {
            User otherUser = User.builder()
                    .clerkId("clerk_other_456")
                    .username("otheruser")
                    .bio("other bio")
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();
            Comment existingComment = Comment.builder()
                    .id(COMMENT_ID)
                    .post(testPost)
                    .userAuthor(otherUser)
                    .body("Original body")
                    .build();
            CommentDto updatedCommentDto = new CommentDto(
                    COMMENT_ID, POST_ID,
                    new UserDto(USER_ID, "testuser", "test bio", "image.com"),
                    "Updated body"
            );

            when(commentRepository.findById(COMMENT_ID)).thenReturn(Optional.of(existingComment));

            assertThatThrownBy(() -> commentService.updateComment(COMMENT_ID, updatedCommentDto, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User is not the author of this comment");

            verify(commentRepository).findById(COMMENT_ID);
            verify(commentRepository, never()).save(any());
        }

        @Test
        @DisplayName("should set updated body on comment entity before saving")
        void shouldSetUpdatedBodyBeforeSaving() {
            Comment existingComment = Comment.builder()
                    .id(COMMENT_ID)
                    .post(testPost)
                    .userAuthor(testUser)
                    .body("Original body")
                    .build();
            CommentDto updatedCommentDto = new CommentDto(
                    COMMENT_ID, POST_ID,
                    new UserDto(USER_ID, "testuser", "test bio", "image.com"),
                    "Brand new body"
            );

            when(commentRepository.findById(COMMENT_ID)).thenReturn(Optional.of(existingComment));
            when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));

            commentService.updateComment(COMMENT_ID, updatedCommentDto, USER_ID);

            assertThat(existingComment.getBody()).isEqualTo("Brand new body");
            verify(commentRepository).save(existingComment);
        }
    }

    @Nested
    @DisplayName("deleteComment")
    class DeleteComment {

        @Test
        @DisplayName("should delete comment successfully when requester is the author")
        void shouldDeleteCommentSuccessfully() {
            Comment existingComment = Comment.builder()
                    .id(COMMENT_ID)
                    .post(testPost)
                    .userAuthor(testUser)
                    .body("Comment body")
                    .build();

            when(commentRepository.findById(COMMENT_ID)).thenReturn(Optional.of(existingComment));

            commentService.deleteComment(COMMENT_ID, USER_ID);

            verify(commentRepository).findById(COMMENT_ID);
            verify(commentRepository).delete(existingComment);
        }

        @Test
        @DisplayName("should throw ResponseStatusException when comment is not found")
        void shouldThrowWhenCommentNotFound() {
            when(commentRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> commentService.deleteComment(999L, USER_ID))
                    .isInstanceOf(ResponseStatusException.class);

            verify(commentRepository).findById(999L);
            verify(commentRepository, never()).delete(any());
        }

        @Test
        @DisplayName("should throw UNAUTHORIZED when requester is not the comment author")
        void shouldThrowUnauthorizedWhenRequesterIsNotAuthor() {
            User otherUser = User.builder()
                    .clerkId("clerk_other_456")
                    .username("otheruser")
                    .bio("other bio")
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();
            Comment existingComment = Comment.builder()
                    .id(COMMENT_ID)
                    .post(testPost)
                    .userAuthor(otherUser)
                    .body("Comment body")
                    .build();

            when(commentRepository.findById(COMMENT_ID)).thenReturn(Optional.of(existingComment));

            assertThatThrownBy(() -> commentService.deleteComment(COMMENT_ID, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User is not the author of this comment");

            verify(commentRepository).findById(COMMENT_ID);
            verify(commentRepository, never()).delete(any());
        }
    }
}
