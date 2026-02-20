package app.sim_feed.user_service.like;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Method;
import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import app.sim_feed.user_service.persona.models.Persona;
import app.sim_feed.user_service.post.models.Post;
import app.sim_feed.user_service.users.models.User;

class LikeTest {

    private User testUser;
    private Persona testPersona;
    private Post testPost;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .clerkId("clerk_user_123")
                .username("testuser")
                .bio("Test bio")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        testPersona = Persona.builder()
                .personaId(1L)
                .bio("Persona bio")
                .username("persona_user")
                .createdAt(OffsetDateTime.now())
                .build();

        testPost = Post.builder()
                .id(1L)
                .title("Test Post")
                .body("Test Body")
                .userAuthor(testUser)
                .build();
    }

    private void invokeValidateAuthor(Like like) throws Exception {
        Method method = Like.class.getDeclaredMethod("validateAuthor");
        method.setAccessible(true);
        try {
            method.invoke(like);
        } catch (java.lang.reflect.InvocationTargetException e) {
            throw (Exception) e.getCause();
        }
    }

    @Test
    @DisplayName("should pass validation when only user is set")
    void shouldPassValidationWithOnlyUser() {
        Like like = Like.builder()
                .post(testPost)
                .user(testUser)
                .persona(null)
                .build();

        assertThatNoException().isThrownBy(() -> invokeValidateAuthor(like));
    }

    @Test
    @DisplayName("should pass validation when only persona is set")
    void shouldPassValidationWithOnlyPersona() {
        Like like = Like.builder()
                .post(testPost)
                .user(null)
                .persona(testPersona)
                .build();

        assertThatNoException().isThrownBy(() -> invokeValidateAuthor(like));
    }

    @Test
    @DisplayName("should throw IllegalStateException when both user and persona are set")
    void shouldThrowWhenBothAuthorsSet() {
        Like like = Like.builder()
                .post(testPost)
                .user(testUser)
                .persona(testPersona)
                .build();

        assertThatThrownBy(() -> invokeValidateAuthor(like))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("A like must have exactly one author");
    }

    @Test
    @DisplayName("should throw IllegalStateException when neither user nor persona is set")
    void shouldThrowWhenNeitherAuthorSet() {
        Like like = Like.builder()
                .post(testPost)
                .user(null)
                .persona(null)
                .build();

        assertThatThrownBy(() -> invokeValidateAuthor(like))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("A like must have exactly one author");
    }

    @Test
    @DisplayName("should correctly map fields via builder")
    void shouldCorrectlyMapFieldsViaBuilder() {
        Like like = Like.builder()
                .id(42L)
                .post(testPost)
                .user(testUser)
                .build();

        assertThat(like.getId()).isEqualTo(42L);
        assertThat(like.getPost()).isEqualTo(testPost);
        assertThat(like.getUser()).isEqualTo(testUser);
        assertThat(like.getPersona()).isNull();
    }

    @Test
    @DisplayName("should allow setting persona via builder")
    void shouldAllowSettingPersonaViaBuilder() {
        Like like = Like.builder()
                .id(99L)
                .post(testPost)
                .persona(testPersona)
                .build();

        assertThat(like.getId()).isEqualTo(99L);
        assertThat(like.getPersona()).isEqualTo(testPersona);
        assertThat(like.getUser()).isNull();
    }

    @Test
    @DisplayName("should allow setting createdAt via builder")
    void shouldAllowSettingCreatedAtViaBuilder() {
        OffsetDateTime now = OffsetDateTime.now();
        Like like = Like.builder()
                .post(testPost)
                .user(testUser)
                .createdAt(now)
                .build();

        assertThat(like.getCreatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("should default createdAt to null when not set via builder")
    void shouldDefaultCreatedAtToNull() {
        Like like = Like.builder()
                .post(testPost)
                .user(testUser)
                .build();

        assertThat(like.getCreatedAt()).isNull();
    }

    @Test
    @DisplayName("should correctly set post reference")
    void shouldCorrectlySetPostReference() {
        Like like = Like.builder()
                .post(testPost)
                .user(testUser)
                .build();

        assertThat(like.getPost()).isNotNull();
        assertThat(like.getPost().getId()).isEqualTo(1L);
        assertThat(like.getPost().getTitle()).isEqualTo("Test Post");
    }

    @Test
    @DisplayName("should support no-args constructor")
    void shouldSupportNoArgsConstructor() {
        Like like = new Like();

        assertThat(like.getId()).isNull();
        assertThat(like.getPost()).isNull();
        assertThat(like.getUser()).isNull();
        assertThat(like.getPersona()).isNull();
        assertThat(like.getCreatedAt()).isNull();
    }

    @Test
    @DisplayName("should support all-args constructor")
    void shouldSupportAllArgsConstructor() {
        OffsetDateTime now = OffsetDateTime.now();
        Like like = new Like(10L, testPost, testPersona, null, now);

        assertThat(like.getId()).isEqualTo(10L);
        assertThat(like.getPost()).isEqualTo(testPost);
        assertThat(like.getPersona()).isEqualTo(testPersona);
        assertThat(like.getUser()).isNull();
        assertThat(like.getCreatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("should support setter methods from @Data annotation")
    void shouldSupportSetterMethods() {
        Like like = new Like();
        like.setId(5L);
        like.setPost(testPost);
        like.setUser(testUser);

        assertThat(like.getId()).isEqualTo(5L);
        assertThat(like.getPost()).isEqualTo(testPost);
        assertThat(like.getUser()).isEqualTo(testUser);
    }
}
