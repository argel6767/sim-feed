package app.sim_feed.user_service.comment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Method;
import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import app.sim_feed.user_service.persona.Persona;
import app.sim_feed.user_service.post.models.Post;
import app.sim_feed.user_service.users.models.User;

class CommentTest {

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

    private void invokeValidateAuthor(Comment comment) throws Exception {
        Method method = Comment.class.getDeclaredMethod("validateAuthor");
        method.setAccessible(true);
        try {
            method.invoke(comment);
        } catch (java.lang.reflect.InvocationTargetException e) {
            throw (Exception) e.getCause();
        }
    }

    @Test
    @DisplayName("should pass validation when only user author is set")
    void shouldPassValidationWithOnlyUserAuthor() {
        Comment comment = Comment.builder()
                .post(testPost)
                .body("A comment")
                .userAuthor(testUser)
                .personaAuthor(null)
                .build();

        assertThatNoException().isThrownBy(() -> invokeValidateAuthor(comment));
    }

    @Test
    @DisplayName("should pass validation when only persona author is set")
    void shouldPassValidationWithOnlyPersonaAuthor() {
        Comment comment = Comment.builder()
                .post(testPost)
                .body("A comment")
                .userAuthor(null)
                .personaAuthor(testPersona)
                .build();

        assertThatNoException().isThrownBy(() -> invokeValidateAuthor(comment));
    }

    @Test
    @DisplayName("should throw IllegalStateException when both authors are set")
    void shouldThrowWhenBothAuthorsSet() {
        Comment comment = Comment.builder()
                .post(testPost)
                .body("A comment")
                .userAuthor(testUser)
                .personaAuthor(testPersona)
                .build();

        assertThatThrownBy(() -> invokeValidateAuthor(comment))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Comment must have exactly one author");
    }

    @Test
    @DisplayName("should throw IllegalStateException when neither author is set")
    void shouldThrowWhenNeitherAuthorSet() {
        Comment comment = Comment.builder()
                .post(testPost)
                .body("A comment")
                .userAuthor(null)
                .personaAuthor(null)
                .build();

        assertThatThrownBy(() -> invokeValidateAuthor(comment))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Comment must have exactly one author");
    }

    @Test
    @DisplayName("should correctly map fields via builder")
    void shouldCorrectlyMapFieldsViaBuilder() {
        Comment comment = Comment.builder()
                .id(42L)
                .post(testPost)
                .body("My comment body")
                .userAuthor(testUser)
                .build();

        assertThat(comment.getId()).isEqualTo(42L);
        assertThat(comment.getPost()).isEqualTo(testPost);
        assertThat(comment.getBody()).isEqualTo("My comment body");
        assertThat(comment.getUserAuthor()).isEqualTo(testUser);
        assertThat(comment.getPersonaAuthor()).isNull();
    }

    @Test
    @DisplayName("should allow setting persona author via builder")
    void shouldAllowSettingPersonaAuthorViaBuilder() {
        Comment comment = Comment.builder()
                .id(99L)
                .post(testPost)
                .body("Persona comment")
                .personaAuthor(testPersona)
                .build();

        assertThat(comment.getId()).isEqualTo(99L);
        assertThat(comment.getPersonaAuthor()).isEqualTo(testPersona);
        assertThat(comment.getUserAuthor()).isNull();
    }

    @Test
    @DisplayName("should allow setting createdAt via builder")
    void shouldAllowSettingCreatedAtViaBuilder() {
        OffsetDateTime now = OffsetDateTime.now();
        Comment comment = Comment.builder()
                .post(testPost)
                .body("Comment")
                .userAuthor(testUser)
                .createdAt(now)
                .build();

        assertThat(comment.getCreatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("should default createdAt to null when not set via builder")
    void shouldDefaultCreatedAtToNull() {
        Comment comment = Comment.builder()
                .post(testPost)
                .body("Comment")
                .userAuthor(testUser)
                .build();

        assertThat(comment.getCreatedAt()).isNull();
    }
}
