package app.sim_feed.user_service.like.models;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import app.sim_feed.user_service.persona.models.Persona;
import app.sim_feed.user_service.persona.models.PersonaDto;
import app.sim_feed.user_service.post.models.Post;
import app.sim_feed.user_service.post.models.PostDto;
import app.sim_feed.user_service.users.models.User;
import app.sim_feed.user_service.users.models.UserDto;

class LikeDtoTest {

    private User testUser;
    private Post testPost;
    private Persona testPersona;

    private static final String USER_ID = "clerk_user_123";
    private static final Long POST_ID = 1L;
    private static final Long PERSONA_ID = 10L;
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

        testPersona = Persona.builder()
                .personaId(PERSONA_ID)
                .username("test_persona")
                .bio("persona bio")
                .createdAt(OffsetDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("of(Like like) factory method")
    class OfLikeFactoryMethod {

        @Test
        @DisplayName("should map Like with user correctly")
        void shouldMapLikeWithUserCorrectly() {
            Like like = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .user(testUser)
                    .build();

            LikeDto dto = LikeDto.of(like);

            assertThat(dto.id()).isEqualTo(LIKE_ID);
            assertThat(dto.post()).isEqualTo(PostDto.of(testPost));
            assertThat(dto.user()).isEqualTo(UserDto.of(testUser));
            assertThat(dto.persona()).isNull();
        }

        @Test
        @DisplayName("should map Like with persona correctly")
        void shouldMapLikeWithPersonaCorrectly() {
            Like like = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .persona(testPersona)
                    .build();

            LikeDto dto = LikeDto.of(like);

            assertThat(dto.id()).isEqualTo(LIKE_ID);
            assertThat(dto.post()).isEqualTo(PostDto.of(testPost));
            assertThat(dto.user()).isNull();
            assertThat(dto.persona()).isEqualTo(PersonaDto.of(testPersona));
        }

        @Test
        @DisplayName("should map user id correctly")
        void shouldMapUserIdCorrectly() {
            Like like = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .user(testUser)
                    .build();

            LikeDto dto = LikeDto.of(like);

            assertThat(dto.user().id()).isEqualTo(USER_ID);
        }

        @Test
        @DisplayName("should map persona id correctly")
        void shouldMapPersonaIdCorrectly() {
            Like like = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .persona(testPersona)
                    .build();

            LikeDto dto = LikeDto.of(like);

            assertThat(dto.persona().personaId()).isEqualTo(PERSONA_ID);
        }

        @Test
        @DisplayName("should map post id correctly")
        void shouldMapPostIdCorrectly() {
            Like like = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .user(testUser)
                    .build();

            LikeDto dto = LikeDto.of(like);

            assertThat(dto.post().id()).isEqualTo(POST_ID);
        }

        @Test
        @DisplayName("should map id field from Like entity")
        void shouldMapIdFromEntity() {
            Like like = Like.builder()
                    .id(42L)
                    .post(testPost)
                    .user(testUser)
                    .build();

            LikeDto dto = LikeDto.of(like);

            assertThat(dto.id()).isEqualTo(42L);
        }

        @Test
        @DisplayName("should throw NullPointerException when like is null")
        void shouldThrowWhenLikeIsNull() {
            assertThatThrownBy(() -> LikeDto.of((Like) null))
                    .isInstanceOf(NullPointerException.class);
        }

        @Test
        @DisplayName("should set persona to null when like has a user")
        void shouldSetPersonaToNullWhenLikeHasUser() {
            Like like = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .user(testUser)
                    .build();

            LikeDto dto = LikeDto.of(like);

            assertThat(dto.persona()).isNull();
        }

        @Test
        @DisplayName("should set user to null when like has a persona")
        void shouldSetUserToNullWhenLikeHasPersona() {
            Like like = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .persona(testPersona)
                    .build();

            LikeDto dto = LikeDto.of(like);

            assertThat(dto.user()).isNull();
        }
    }

    @Nested
    @DisplayName("of(Long id, Post post, User user) factory method")
    class OfIdPostUserFactoryMethod {

        @Test
        @DisplayName("should map id, post, and user correctly")
        void shouldMapIdPostAndUserCorrectly() {
            LikeDto dto = LikeDto.of(LIKE_ID, testPost, testUser);

            assertThat(dto.id()).isEqualTo(LIKE_ID);
            assertThat(dto.post()).isEqualTo(PostDto.of(testPost));
            assertThat(dto.user()).isEqualTo(UserDto.of(testUser));
            assertThat(dto.persona()).isNull();
        }

        @Test
        @DisplayName("should always set persona to null")
        void shouldAlwaysSetPersonaToNull() {
            LikeDto dto = LikeDto.of(LIKE_ID, testPost, testUser);

            assertThat(dto.persona()).isNull();
        }

        @Test
        @DisplayName("should map user id correctly")
        void shouldMapUserIdCorrectly() {
            LikeDto dto = LikeDto.of(LIKE_ID, testPost, testUser);

            assertThat(dto.user().id()).isEqualTo(USER_ID);
        }

        @Test
        @DisplayName("should map post id correctly")
        void shouldMapPostIdCorrectly() {
            LikeDto dto = LikeDto.of(LIKE_ID, testPost, testUser);

            assertThat(dto.post().id()).isEqualTo(POST_ID);
        }

        @Test
        @DisplayName("should map post title and body correctly")
        void shouldMapPostTitleAndBodyCorrectly() {
            LikeDto dto = LikeDto.of(LIKE_ID, testPost, testUser);

            assertThat(dto.post().title()).isEqualTo("Test Post");
            assertThat(dto.post().body()).isEqualTo("Test post body");
        }
    }

    @Nested
    @DisplayName("record semantics")
    class RecordSemantics {

        @Test
        @DisplayName("should create instance via constructor with user")
        void shouldCreateViaConstructorWithUser() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            PostDto postDto = new PostDto(userDto, POST_ID, "Test Post", "Test post body");

            LikeDto dto = new LikeDto(LIKE_ID, postDto, userDto, null);

            assertThat(dto.id()).isEqualTo(LIKE_ID);
            assertThat(dto.post()).isEqualTo(postDto);
            assertThat(dto.user()).isEqualTo(userDto);
            assertThat(dto.persona()).isNull();
        }

        @Test
        @DisplayName("should create instance via constructor with persona")
        void shouldCreateViaConstructorWithPersona() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            PostDto postDto = new PostDto(userDto, POST_ID, "Test Post", "Test post body");
            PersonaDto personaDto = new PersonaDto(PERSONA_ID, "test_persona");

            LikeDto dto = new LikeDto(LIKE_ID, postDto, null, personaDto);

            assertThat(dto.id()).isEqualTo(LIKE_ID);
            assertThat(dto.post()).isEqualTo(postDto);
            assertThat(dto.user()).isNull();
            assertThat(dto.persona()).isEqualTo(personaDto);
        }

        @Test
        @DisplayName("should be equal when all fields match")
        void shouldBeEqualWhenAllFieldsMatch() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            PostDto postDto = new PostDto(userDto, POST_ID, "Test Post", "Test post body");

            LikeDto dto1 = new LikeDto(LIKE_ID, postDto, userDto, null);
            LikeDto dto2 = new LikeDto(LIKE_ID, postDto, userDto, null);

            assertThat(dto1).isEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when id differs")
        void shouldNotBeEqualWhenIdDiffers() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            PostDto postDto = new PostDto(userDto, POST_ID, "Test Post", "Test post body");

            LikeDto dto1 = new LikeDto(1L, postDto, userDto, null);
            LikeDto dto2 = new LikeDto(2L, postDto, userDto, null);

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when post differs")
        void shouldNotBeEqualWhenPostDiffers() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            PostDto postDto1 = new PostDto(userDto, POST_ID, "Post A", "Body A");
            PostDto postDto2 = new PostDto(userDto, 2L, "Post B", "Body B");

            LikeDto dto1 = new LikeDto(LIKE_ID, postDto1, userDto, null);
            LikeDto dto2 = new LikeDto(LIKE_ID, postDto2, userDto, null);

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when user differs")
        void shouldNotBeEqualWhenUserDiffers() {
            UserDto userDto1 = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            UserDto userDto2 = new UserDto("clerk_other_456", "otheruser", "other bio", "image.com");
            PostDto postDto = new PostDto(userDto1, POST_ID, "Test Post", "Test post body");

            LikeDto dto1 = new LikeDto(LIKE_ID, postDto, userDto1, null);
            LikeDto dto2 = new LikeDto(LIKE_ID, postDto, userDto2, null);

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when persona differs")
        void shouldNotBeEqualWhenPersonaDiffers() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            PostDto postDto = new PostDto(userDto, POST_ID, "Test Post", "Test post body");
            PersonaDto persona1 = new PersonaDto(10L, "persona_a");
            PersonaDto persona2 = new PersonaDto(20L, "persona_b");

            LikeDto dto1 = new LikeDto(LIKE_ID, postDto, null, persona1);
            LikeDto dto2 = new LikeDto(LIKE_ID, postDto, null, persona2);

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should have consistent hashCode for equal instances")
        void shouldHaveConsistentHashCode() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            PostDto postDto = new PostDto(userDto, POST_ID, "Test Post", "Test post body");

            LikeDto dto1 = new LikeDto(LIKE_ID, postDto, userDto, null);
            LikeDto dto2 = new LikeDto(LIKE_ID, postDto, userDto, null);

            assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
        }

        @Test
        @DisplayName("should include id in toString")
        void shouldIncludeIdInToString() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            PostDto postDto = new PostDto(userDto, POST_ID, "Test Post", "Test post body");

            LikeDto dto = new LikeDto(LIKE_ID, postDto, userDto, null);

            assertThat(dto.toString()).contains(LIKE_ID.toString());
        }

        @Test
        @DisplayName("should allow null values for all fields")
        void shouldAllowNullValues() {
            LikeDto dto = new LikeDto(null, null, null, null);

            assertThat(dto.id()).isNull();
            assertThat(dto.post()).isNull();
            assertThat(dto.user()).isNull();
            assertThat(dto.persona()).isNull();
        }

        @Test
        @DisplayName("should not be equal to null")
        void shouldNotBeEqualToNull() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            PostDto postDto = new PostDto(userDto, POST_ID, "Test Post", "Test post body");
            LikeDto dto = new LikeDto(LIKE_ID, postDto, userDto, null);

            assertThat(dto).isNotEqualTo(null);
        }

        @Test
        @DisplayName("should be equal to itself")
        void shouldBeEqualToItself() {
            UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
            PostDto postDto = new PostDto(userDto, POST_ID, "Test Post", "Test post body");
            LikeDto dto = new LikeDto(LIKE_ID, postDto, userDto, null);

            assertThat(dto).isEqualTo(dto);
        }
    }

    @Nested
    @DisplayName("of factory method round-trip")
    class RoundTrip {

        @Test
        @DisplayName("should produce consistent DTO from same Like entity")
        void shouldProduceConsistentDtoFromSameLike() {
            Like like = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .user(testUser)
                    .build();

            LikeDto dto1 = LikeDto.of(like);
            LikeDto dto2 = LikeDto.of(like);

            assertThat(dto1).isEqualTo(dto2);
        }

        @Test
        @DisplayName("should produce different DTOs from different Like entities")
        void shouldProduceDifferentDtosFromDifferentLikes() {
            Like likeWithUser = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .user(testUser)
                    .build();

            Like likeWithPersona = Like.builder()
                    .id(200L)
                    .post(testPost)
                    .persona(testPersona)
                    .build();

            LikeDto dto1 = LikeDto.of(likeWithUser);
            LikeDto dto2 = LikeDto.of(likeWithPersona);

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("of(Like) and of(Long, Post, User) should produce equal DTOs for same data")
        void shouldProduceEqualDtosFromBothFactoryMethods() {
            Like like = Like.builder()
                    .id(LIKE_ID)
                    .post(testPost)
                    .user(testUser)
                    .build();

            LikeDto fromLike = LikeDto.of(like);
            LikeDto fromComponents = LikeDto.of(LIKE_ID, testPost, testUser);

            assertThat(fromLike).isEqualTo(fromComponents);
        }
    }
}
