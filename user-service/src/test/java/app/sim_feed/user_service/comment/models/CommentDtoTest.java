package app.sim_feed.user_service.comment.models;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import app.sim_feed.user_service.post.models.Post;
import app.sim_feed.user_service.users.models.User;
import app.sim_feed.user_service.users.models.UserDto;

class CommentDtoTest {

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
                .imageUrl("image.com")
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
    @DisplayName("of(Comment) factory method")
    class OfCommentFactoryMethod {

        @Test
        @DisplayName("should map comment id correctly")
        void shouldMapCommentIdCorrectly() {
            Comment comment = Comment.builder()
                    .id(COMMENT_ID)
                    .post(testPost)
                    .userAuthor(testUser)
                    .body("Test body")
                    .build();

            CommentDto dto = CommentDto.of(comment);

            assertThat(dto.commentId()).isEqualTo(COMMENT_ID);
        }

        @Test
        @DisplayName("should map post id correctly")
        void shouldMapPostIdCorrectly() {
            Comment comment = Comment.builder()
                    .id(COMMENT_ID)
                    .post(testPost)
                    .userAuthor(testUser)
                    .body("Test body")
                    .build();

            CommentDto dto = CommentDto.of(comment);

            assertThat(dto.postId()).isEqualTo(POST_ID);
        }

        @Test
        @DisplayName("should map comment author from userAuthor correctly")
        void shouldMapCommentAuthorCorrectly() {
            Comment comment = Comment.builder()
                    .id(COMMENT_ID)
                    .post(testPost)
                    .userAuthor(testUser)
                    .body("Test body")
                    .build();

            CommentDto dto = CommentDto.of(comment);

            assertThat(dto.commentAuthor()).isEqualTo(UserDto.of(testUser));
            assertThat(dto.commentAuthor().id()).isEqualTo(USER_ID);
        }

        @Test
        @DisplayName("should map body correctly")
        void shouldMapBodyCorrectly() {
            Comment comment = Comment.builder()
                    .id(COMMENT_ID)
                    .post(testPost)
                    .userAuthor(testUser)
                    .body("Test body")
                    .build();

            CommentDto dto = CommentDto.of(comment);

            assertThat(dto.body()).isEqualTo("Test body");
        }

        @Test
        @DisplayName("should throw NullPointerException when comment is null")
        void shouldThrowWhenCommentIsNull() {
            assertThatThrownBy(() -> CommentDto.of((Comment) null))
                    .isInstanceOf(NullPointerException.class);
        }

        @Test
        @DisplayName("should map all fields from a single comment entity")
        void shouldMapAllFieldsFromEntity() {
            Comment comment = Comment.builder()
                    .id(COMMENT_ID)
                    .post(testPost)
                    .userAuthor(testUser)
                    .body("Full body test")
                    .build();

            CommentDto dto = CommentDto.of(comment);

            assertThat(dto.commentId()).isEqualTo(COMMENT_ID);
            assertThat(dto.postId()).isEqualTo(POST_ID);
            assertThat(dto.commentAuthor().id()).isEqualTo(USER_ID);
            assertThat(dto.body()).isEqualTo("Full body test");
        }
    }

    @Nested
    @DisplayName("of(Long, Post, User, String) factory method")
    class OfFieldsFactoryMethod {

        @Test
        @DisplayName("should map commentId correctly")
        void shouldMapCommentIdCorrectly() {
            CommentDto dto = CommentDto.of(COMMENT_ID, testPost, testUser, "Some body");

            assertThat(dto.commentId()).isEqualTo(COMMENT_ID);
        }

        @Test
        @DisplayName("should map post id from post entity correctly")
        void shouldMapPostIdCorrectly() {
            CommentDto dto = CommentDto.of(COMMENT_ID, testPost, testUser, "Some body");

            assertThat(dto.postId()).isEqualTo(POST_ID);
        }

        @Test
        @DisplayName("should map commentAuthor from user entity correctly")
        void shouldMapCommentAuthorFromUser() {
            CommentDto dto = CommentDto.of(COMMENT_ID, testPost, testUser, "Some body");

            assertThat(dto.commentAuthor()).isEqualTo(UserDto.of(testUser));
            assertThat(dto.commentAuthor().id()).isEqualTo(USER_ID);
        }

        @Test
        @DisplayName("should map body correctly")
        void shouldMapBodyCorrectly() {
            CommentDto dto = CommentDto.of(COMMENT_ID, testPost, testUser, "Direct body");

            assertThat(dto.body()).isEqualTo("Direct body");
        }

        @Test
        @DisplayName("should produce same result as of(Comment) for equivalent data")
        void shouldProduceSameResultAsCommentFactory() {
            Comment comment = Comment.builder()
                    .id(COMMENT_ID)
                    .post(testPost)
                    .userAuthor(testUser)
                    .body("Same body")
                    .build();

            CommentDto dtoFromComment = CommentDto.of(comment);
            CommentDto dtoFromFields = CommentDto.of(COMMENT_ID, testPost, testUser, "Same body");

            assertThat(dtoFromComment).isEqualTo(dtoFromFields);
        }

        @Test
        @DisplayName("should allow null body")
        void shouldAllowNullBody() {
            CommentDto dto = CommentDto.of(COMMENT_ID, testPost, testUser, null);

            assertThat(dto.body()).isNull();
        }
    }

    @Nested
    @DisplayName("record semantics")
    class RecordSemantics {

        @Test
        @DisplayName("should create instance via constructor")
        void shouldCreateViaConstructor() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            CommentDto dto = new CommentDto(COMMENT_ID, POST_ID, userDto, "Constructor body");

            assertThat(dto.commentId()).isEqualTo(COMMENT_ID);
            assertThat(dto.postId()).isEqualTo(POST_ID);
            assertThat(dto.commentAuthor()).isEqualTo(userDto);
            assertThat(dto.body()).isEqualTo("Constructor body");
        }

        @Test
        @DisplayName("should be equal when all fields match")
        void shouldBeEqualWhenAllFieldsMatch() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            CommentDto dto1 = new CommentDto(COMMENT_ID, POST_ID, userDto, "Same body");
            CommentDto dto2 = new CommentDto(COMMENT_ID, POST_ID, userDto, "Same body");

            assertThat(dto1).isEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when commentId differs")
        void shouldNotBeEqualWhenCommentIdDiffers() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            CommentDto dto1 = new CommentDto(10L, POST_ID, userDto, "Same body");
            CommentDto dto2 = new CommentDto(20L, POST_ID, userDto, "Same body");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when postId differs")
        void shouldNotBeEqualWhenPostIdDiffers() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            CommentDto dto1 = new CommentDto(COMMENT_ID, 1L, userDto, "Same body");
            CommentDto dto2 = new CommentDto(COMMENT_ID, 2L, userDto, "Same body");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when commentAuthor differs")
        void shouldNotBeEqualWhenCommentAuthorDiffers() {
            UserDto userDto1 = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            UserDto userDto2 = new UserDto("clerk_other_456", "otheruser", "other bio", "image.com");
            CommentDto dto1 = new CommentDto(COMMENT_ID, POST_ID, userDto1, "Same body");
            CommentDto dto2 = new CommentDto(COMMENT_ID, POST_ID, userDto2, "Same body");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when body differs")
        void shouldNotBeEqualWhenBodyDiffers() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            CommentDto dto1 = new CommentDto(COMMENT_ID, POST_ID, userDto, "Body A");
            CommentDto dto2 = new CommentDto(COMMENT_ID, POST_ID, userDto, "Body B");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should have consistent hashCode for equal instances")
        void shouldHaveConsistentHashCode() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            CommentDto dto1 = new CommentDto(COMMENT_ID, POST_ID, userDto, "Same body");
            CommentDto dto2 = new CommentDto(COMMENT_ID, POST_ID, userDto, "Same body");

            assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
        }

        @Test
        @DisplayName("should include all fields in toString")
        void shouldIncludeAllFieldsInToString() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            CommentDto dto = new CommentDto(COMMENT_ID, POST_ID, userDto, "ToString body");

            String toString = dto.toString();
            assertThat(toString).contains(COMMENT_ID.toString());
            assertThat(toString).contains(POST_ID.toString());
        }

        @Test
        @DisplayName("should allow null values for all fields")
        void shouldAllowNullValues() {
            CommentDto dto = new CommentDto(null, null, null, null);

            assertThat(dto.commentId()).isNull();
            assertThat(dto.postId()).isNull();
            assertThat(dto.commentAuthor()).isNull();
            assertThat(dto.body()).isNull();
        }

        @Test
        @DisplayName("should not be equal to null")
        void shouldNotBeEqualToNull() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            CommentDto dto = new CommentDto(COMMENT_ID, POST_ID, userDto, "Some body");

            assertThat(dto).isNotEqualTo(null);
        }

        @Test
        @DisplayName("should be equal to itself")
        void shouldBeEqualToItself() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            CommentDto dto = new CommentDto(COMMENT_ID, POST_ID, userDto, "Some body");

            assertThat(dto).isEqualTo(dto);
        }
    }

    @Nested
    @DisplayName("of factory method round-trip")
    class RoundTrip {

        @Test
        @DisplayName("should produce consistent DTO from the same Comment entity")
        void shouldProduceConsistentDtoFromSameEntity() {
            Comment comment = Comment.builder()
                    .id(COMMENT_ID)
                    .post(testPost)
                    .userAuthor(testUser)
                    .body("Round-trip body")
                    .build();

            CommentDto dto1 = CommentDto.of(comment);
            CommentDto dto2 = CommentDto.of(comment);

            assertThat(dto1).isEqualTo(dto2);
        }

        @Test
        @DisplayName("should produce different DTOs from different Comment entities")
        void shouldProduceDifferentDtosFromDifferentEntities() {
            Comment comment1 = Comment.builder()
                    .id(COMMENT_ID)
                    .post(testPost)
                    .userAuthor(testUser)
                    .body("First body")
                    .build();

            Comment comment2 = Comment.builder()
                    .id(99L)
                    .post(testPost)
                    .userAuthor(testUser)
                    .body("Second body")
                    .build();

            CommentDto dto1 = CommentDto.of(comment1);
            CommentDto dto2 = CommentDto.of(comment2);

            assertThat(dto1).isNotEqualTo(dto2);
        }
    }
}
