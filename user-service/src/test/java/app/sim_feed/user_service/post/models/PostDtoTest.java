package app.sim_feed.user_service.post.models;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import app.sim_feed.user_service.users.models.User;
import app.sim_feed.user_service.users.models.UserDto;

class PostDtoTest {

    private User testUser;
    private Post testPost;
    private final String CLERK_ID = "clerk_user_123";
    private final String USERNAME = "testuser";
    private final String BIO = "This is a test bio";

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .clerkId(CLERK_ID)
                .username(USERNAME)
                .bio(BIO)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        testPost = Post.builder()
                .id(1L)
                .title("Test Title")
                .body("Test body content")
                .userAuthor(testUser)
                .createdAt(OffsetDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("of (factory method)")
    class OfFactoryMethod {

        @Test
        @DisplayName("should map post id correctly")
        void shouldMapPostIdCorrectly() {
            PostDto dto = PostDto.of(testPost);

            assertThat(dto.id()).isEqualTo(1L);
        }

        @Test
        @DisplayName("should map title correctly")
        void shouldMapTitleCorrectly() {
            PostDto dto = PostDto.of(testPost);

            assertThat(dto.title()).isEqualTo("Test Title");
        }

        @Test
        @DisplayName("should map body correctly")
        void shouldMapBodyCorrectly() {
            PostDto dto = PostDto.of(testPost);

            assertThat(dto.body()).isEqualTo("Test body content");
        }

        @Test
        @DisplayName("should map user author to nested UserDto")
        void shouldMapUserAuthorToNestedUserDto() {
            PostDto dto = PostDto.of(testPost);

            assertThat(dto.user()).isNotNull();
            assertThat(dto.user().id()).isEqualTo(CLERK_ID);
            assertThat(dto.user().username()).isEqualTo(USERNAME);
            assertThat(dto.user().bio()).isEqualTo(BIO);
        }

        @Test
        @DisplayName("should produce UserDto equivalent to UserDto.of for the same user")
        void shouldProduceEquivalentUserDto() {
            PostDto postDto = PostDto.of(testPost);
            UserDto directUserDto = UserDto.of(testUser);

            assertThat(postDto.user()).isEqualTo(directUserDto);
        }

        @Test
        @DisplayName("should handle null post id (unsaved post)")
        void shouldHandleNullPostId() {
            Post unsavedPost = Post.builder()
                    .id(null)
                    .title("Unsaved Title")
                    .body("Unsaved Body")
                    .userAuthor(testUser)
                    .build();

            PostDto dto = PostDto.of(unsavedPost);

            assertThat(dto.id()).isNull();
            assertThat(dto.title()).isEqualTo("Unsaved Title");
            assertThat(dto.body()).isEqualTo("Unsaved Body");
        }

        @Test
        @DisplayName("should throw NullPointerException when post is null")
        void shouldThrowWhenPostIsNull() {
            assertThatThrownBy(() -> PostDto.of(null))
                    .isInstanceOf(NullPointerException.class);
        }

        @Test
        @DisplayName("should throw NullPointerException when post has null userAuthor")
        void shouldThrowWhenUserAuthorIsNull() {
            Post postWithNoUser = Post.builder()
                    .id(2L)
                    .title("Title")
                    .body("Body")
                    .userAuthor(null)
                    .build();

            assertThatThrownBy(() -> PostDto.of(postWithNoUser))
                    .isInstanceOf(NullPointerException.class);
        }

        @Test
        @DisplayName("should handle post with empty title and body")
        void shouldHandlePostWithEmptyTitleAndBody() {
            Post emptyFieldsPost = Post.builder()
                    .id(3L)
                    .title("")
                    .body("")
                    .userAuthor(testUser)
                    .build();

            PostDto dto = PostDto.of(emptyFieldsPost);

            assertThat(dto.title()).isEmpty();
            assertThat(dto.body()).isEmpty();
        }

        @Test
        @DisplayName("should handle post with very long title and body")
        void shouldHandlePostWithLongContent() {
            String longTitle = "a".repeat(255);
            String longBody = "b".repeat(10000);
            Post longPost = Post.builder()
                    .id(4L)
                    .title(longTitle)
                    .body(longBody)
                    .userAuthor(testUser)
                    .build();

            PostDto dto = PostDto.of(longPost);

            assertThat(dto.title()).isEqualTo(longTitle);
            assertThat(dto.body()).isEqualTo(longBody);
        }

        @Test
        @DisplayName("should not include timestamps or collections from post entity")
        void shouldOnlyIncludeRelevantFields() {
            PostDto dto = PostDto.of(testPost);

            assertThat(dto.user()).isEqualTo(UserDto.of(testPost.getUserAuthor()));
            assertThat(dto.id()).isEqualTo(testPost.getId());
            assertThat(dto.title()).isEqualTo(testPost.getTitle());
            assertThat(dto.body()).isEqualTo(testPost.getBody());
        }
    }

    @Nested
    @DisplayName("record semantics")
    class RecordSemantics {

        @Test
        @DisplayName("should create instance via constructor")
        void shouldCreateViaConstructor() {
            UserDto userDto = new UserDto("id_123", "myuser", "my bio");
            PostDto dto = new PostDto(userDto, 10L, "My Title", "My Body");

            assertThat(dto.user()).isEqualTo(userDto);
            assertThat(dto.id()).isEqualTo(10L);
            assertThat(dto.title()).isEqualTo("My Title");
            assertThat(dto.body()).isEqualTo("My Body");
        }

        @Test
        @DisplayName("should be equal when all fields match")
        void shouldBeEqualWhenAllFieldsMatch() {
            UserDto userDto = new UserDto("id_1", "user1", "bio1");
            PostDto dto1 = new PostDto(userDto, 1L, "Title", "Body");
            PostDto dto2 = new PostDto(userDto, 1L, "Title", "Body");

            assertThat(dto1).isEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when id differs")
        void shouldNotBeEqualWhenIdDiffers() {
            UserDto userDto = new UserDto("id_1", "user1", "bio1");
            PostDto dto1 = new PostDto(userDto, 1L, "Title", "Body");
            PostDto dto2 = new PostDto(userDto, 2L, "Title", "Body");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when title differs")
        void shouldNotBeEqualWhenTitleDiffers() {
            UserDto userDto = new UserDto("id_1", "user1", "bio1");
            PostDto dto1 = new PostDto(userDto, 1L, "Title A", "Body");
            PostDto dto2 = new PostDto(userDto, 1L, "Title B", "Body");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when body differs")
        void shouldNotBeEqualWhenBodyDiffers() {
            UserDto userDto = new UserDto("id_1", "user1", "bio1");
            PostDto dto1 = new PostDto(userDto, 1L, "Title", "Body A");
            PostDto dto2 = new PostDto(userDto, 1L, "Title", "Body B");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when user differs")
        void shouldNotBeEqualWhenUserDiffers() {
            UserDto userDto1 = new UserDto("id_1", "user1", "bio1");
            UserDto userDto2 = new UserDto("id_2", "user2", "bio2");
            PostDto dto1 = new PostDto(userDto1, 1L, "Title", "Body");
            PostDto dto2 = new PostDto(userDto2, 1L, "Title", "Body");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should have consistent hashCode for equal instances")
        void shouldHaveConsistentHashCode() {
            UserDto userDto = new UserDto("id_1", "user1", "bio1");
            PostDto dto1 = new PostDto(userDto, 1L, "Title", "Body");
            PostDto dto2 = new PostDto(userDto, 1L, "Title", "Body");

            assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
        }

        @Test
        @DisplayName("should include all fields in toString")
        void shouldIncludeAllFieldsInToString() {
            UserDto userDto = new UserDto("id_1", "user1", "bio1");
            PostDto dto = new PostDto(userDto, 42L, "My Title", "My Body");

            String toString = dto.toString();
            assertThat(toString).contains("42");
            assertThat(toString).contains("My Title");
            assertThat(toString).contains("My Body");
        }

        @Test
        @DisplayName("should allow null values for all fields")
        void shouldAllowNullValues() {
            PostDto dto = new PostDto(null, null, null, null);

            assertThat(dto.user()).isNull();
            assertThat(dto.id()).isNull();
            assertThat(dto.title()).isNull();
            assertThat(dto.body()).isNull();
        }
    }

    @Nested
    @DisplayName("of factory method round-trip")
    class RoundTrip {

        @Test
        @DisplayName("should produce consistent DTO from same post entity")
        void shouldProduceConsistentDtoFromSamePost() {
            PostDto dto1 = PostDto.of(testPost);
            PostDto dto2 = PostDto.of(testPost);

            assertThat(dto1).isEqualTo(dto2);
        }

        @Test
        @DisplayName("should produce different DTOs from different post entities")
        void shouldProduceDifferentDtosFromDifferentPosts() {
            Post anotherPost = Post.builder()
                    .id(99L)
                    .title("Another Title")
                    .body("Another Body")
                    .userAuthor(testUser)
                    .createdAt(OffsetDateTime.now())
                    .build();

            PostDto dto1 = PostDto.of(testPost);
            PostDto dto2 = PostDto.of(anotherPost);

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should produce different DTOs when posts have different authors")
        void shouldProduceDifferentDtosWhenDifferentAuthors() {
            User anotherUser = User.builder()
                    .clerkId("clerk_other_456")
                    .username("otheruser")
                    .bio("Other bio")
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();

            Post postByAnotherUser = Post.builder()
                    .id(1L)
                    .title("Test Title")
                    .body("Test body content")
                    .userAuthor(anotherUser)
                    .createdAt(OffsetDateTime.now())
                    .build();

            PostDto dto1 = PostDto.of(testPost);
            PostDto dto2 = PostDto.of(postByAnotherUser);

            assertThat(dto1.id()).isEqualTo(dto2.id());
            assertThat(dto1.title()).isEqualTo(dto2.title());
            assertThat(dto1.body()).isEqualTo(dto2.body());
            assertThat(dto1.user()).isNotEqualTo(dto2.user());
            assertThat(dto1).isNotEqualTo(dto2);
        }
    }
}
