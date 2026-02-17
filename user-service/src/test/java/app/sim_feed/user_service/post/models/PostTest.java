package app.sim_feed.user_service.post.models;

import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Method;
import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import app.sim_feed.user_service.persona.models.Persona;
import app.sim_feed.user_service.users.models.User;

class PostTest {

    private User testUser;
    private Persona testPersona;

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
    }

    private void invokeValidateAuthor(Post post) throws Exception {
        Method method = Post.class.getDeclaredMethod("validateAuthor");
        method.setAccessible(true);
        try {
            method.invoke(post);
        } catch (java.lang.reflect.InvocationTargetException e) {
            throw (Exception) e.getCause();
        }
    }

    @Test
    @DisplayName("should pass validation when only user author is set")
    void shouldPassValidationWithOnlyUserAuthor() {
        Post post = Post.builder()
                .title("Title")
                .body("Body")
                .userAuthor(testUser)
                .personaAuthor(null)
                .build();

        assertThatNoException().isThrownBy(() -> invokeValidateAuthor(post));
    }

    @Test
    @DisplayName("should pass validation when only persona author is set")
    void shouldPassValidationWithOnlyPersonaAuthor() {
        Post post = Post.builder()
                .title("Title")
                .body("Body")
                .userAuthor(null)
                .personaAuthor(testPersona)
                .build();

        assertThatNoException().isThrownBy(() -> invokeValidateAuthor(post));
    }

    @Test
    @DisplayName("should throw IllegalStateException when both authors are set")
    void shouldThrowWhenBothAuthorsSet() {
        Post post = Post.builder()
                .title("Title")
                .body("Body")
                .userAuthor(testUser)
                .personaAuthor(testPersona)
                .build();

        assertThatThrownBy(() -> invokeValidateAuthor(post))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Post must have exactly one author");
    }

    @Test
    @DisplayName("should throw IllegalStateException when neither author is set")
    void shouldThrowWhenNeitherAuthorSet() {
        Post post = Post.builder()
                .title("Title")
                .body("Body")
                .userAuthor(null)
                .personaAuthor(null)
                .build();

        assertThatThrownBy(() -> invokeValidateAuthor(post))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Post must have exactly one author");
    }

    @Test
    @DisplayName("should correctly map fields via builder")
    void shouldCorrectlyMapFieldsViaBuilder() {
        Post post = Post.builder()
                .id(42L)
                .title("My Title")
                .body("My Body")
                .userAuthor(testUser)
                .build();

        org.assertj.core.api.Assertions.assertThat(post.getId()).isEqualTo(42L);
        org.assertj.core.api.Assertions.assertThat(post.getTitle()).isEqualTo("My Title");
        org.assertj.core.api.Assertions.assertThat(post.getBody()).isEqualTo("My Body");
        org.assertj.core.api.Assertions.assertThat(post.getUserAuthor()).isEqualTo(testUser);
        org.assertj.core.api.Assertions.assertThat(post.getPersonaAuthor()).isNull();
    }

    @Test
    @DisplayName("should initialize comments and likes as empty lists by default")
    void shouldInitializeCollectionsAsEmptyByDefault() {
        Post post = Post.builder()
                .title("Title")
                .body("Body")
                .userAuthor(testUser)
                .build();

        org.assertj.core.api.Assertions.assertThat(post.getComments()).isNotNull().isEmpty();
        org.assertj.core.api.Assertions.assertThat(post.getLikes()).isNotNull().isEmpty();
    }
}
