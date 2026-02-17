package app.sim_feed.user_service.chats;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Method;
import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import app.sim_feed.user_service.persona.Persona;
import app.sim_feed.user_service.users.models.User;

class ChatMemberTest {

    private User testUser;
    private Persona testPersona;
    private Chat testChat;

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

        testChat = new Chat();
        testChat.setId(1L);
        testChat.setChatName("Test Chat");
        testChat.setCreatorId("clerk_user_123");
    }

    private void invokeValidateAuthor(ChatMember chatMember) throws Exception {
        Method method = ChatMember.class.getDeclaredMethod("validateAuthor");
        method.setAccessible(true);
        try {
            method.invoke(chatMember);
        } catch (java.lang.reflect.InvocationTargetException e) {
            throw (Exception) e.getCause();
        }
    }

    private void invokeOnPrePersist(ChatMember chatMember) throws Exception {
        Method method = ChatMember.class.getDeclaredMethod("onPrePersist");
        method.setAccessible(true);
        try {
            method.invoke(chatMember);
        } catch (java.lang.reflect.InvocationTargetException e) {
            throw (Exception) e.getCause();
        }
    }

    private void invokeOnPreUpdate(ChatMember chatMember) throws Exception {
        Method method = ChatMember.class.getDeclaredMethod("onPreUpdate");
        method.setAccessible(true);
        try {
            method.invoke(chatMember);
        } catch (java.lang.reflect.InvocationTargetException e) {
            throw (Exception) e.getCause();
        }
    }

    @Nested
    @DisplayName("validateAuthor")
    class ValidateAuthor {

        @Test
        @DisplayName("should pass validation when only user is set (no persona)")
        void shouldPassValidationWithOnlyUser() {
            ChatMember chatMember = ChatMember.builder()
                    .chat(testChat)
                    .user(testUser)
                    .persona(null)
                    .build();

            assertThatNoException().isThrownBy(() -> invokeValidateAuthor(chatMember));
        }

        @Test
        @DisplayName("should pass validation when only persona is set (no user)")
        void shouldPassValidationWithOnlyPersona() {
            ChatMember chatMember = ChatMember.builder()
                    .chat(testChat)
                    .user(null)
                    .persona(testPersona)
                    .build();

            assertThatNoException().isThrownBy(() -> invokeValidateAuthor(chatMember));
        }

        @Test
        @DisplayName("should throw IllegalStateException when both user and persona are set")
        void shouldThrowWhenBothAuthorsSet() {
            ChatMember chatMember = ChatMember.builder()
                    .chat(testChat)
                    .user(testUser)
                    .persona(testPersona)
                    .build();

            assertThatThrownBy(() -> invokeValidateAuthor(chatMember))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Post must have exactly one author");
        }

        @Test
        @DisplayName("should throw IllegalStateException when neither user nor persona is set")
        void shouldThrowWhenNeitherAuthorSet() {
            ChatMember chatMember = ChatMember.builder()
                    .chat(testChat)
                    .user(null)
                    .persona(null)
                    .build();

            assertThatThrownBy(() -> invokeValidateAuthor(chatMember))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Post must have exactly one author");
        }
    }

    @Nested
    @DisplayName("onPrePersist")
    class OnPrePersist {

        @Test
        @DisplayName("should set joinedAt on pre-persist when validation passes")
        void shouldSetJoinedAtOnPrePersist() throws Exception {
            ChatMember chatMember = ChatMember.builder()
                    .chat(testChat)
                    .user(testUser)
                    .persona(null)
                    .build();

            assertThat(chatMember.getJoinedAt()).isNull();

            invokeOnPrePersist(chatMember);

            assertThat(chatMember.getJoinedAt()).isNotNull();
        }

        @Test
        @DisplayName("should throw IllegalStateException on pre-persist when both authors are set")
        void shouldThrowOnPrePersistWhenBothAuthorsSet() {
            ChatMember chatMember = ChatMember.builder()
                    .chat(testChat)
                    .user(testUser)
                    .persona(testPersona)
                    .build();

            assertThatThrownBy(() -> invokeOnPrePersist(chatMember))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Post must have exactly one author");
        }

        @Test
        @DisplayName("should throw IllegalStateException on pre-persist when neither author is set")
        void shouldThrowOnPrePersistWhenNeitherAuthorSet() {
            ChatMember chatMember = ChatMember.builder()
                    .chat(testChat)
                    .user(null)
                    .persona(null)
                    .build();

            assertThatThrownBy(() -> invokeOnPrePersist(chatMember))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Post must have exactly one author");
        }
    }

    @Nested
    @DisplayName("onPreUpdate")
    class OnPreUpdate {

        @Test
        @DisplayName("should pass on pre-update when only user is set")
        void shouldPassOnPreUpdateWithOnlyUser() {
            ChatMember chatMember = ChatMember.builder()
                    .chat(testChat)
                    .user(testUser)
                    .persona(null)
                    .build();

            assertThatNoException().isThrownBy(() -> invokeOnPreUpdate(chatMember));
        }

        @Test
        @DisplayName("should pass on pre-update when only persona is set")
        void shouldPassOnPreUpdateWithOnlyPersona() {
            ChatMember chatMember = ChatMember.builder()
                    .chat(testChat)
                    .user(null)
                    .persona(testPersona)
                    .build();

            assertThatNoException().isThrownBy(() -> invokeOnPreUpdate(chatMember));
        }

        @Test
        @DisplayName("should throw IllegalStateException on pre-update when both authors are set")
        void shouldThrowOnPreUpdateWhenBothAuthorsSet() {
            ChatMember chatMember = ChatMember.builder()
                    .chat(testChat)
                    .user(testUser)
                    .persona(testPersona)
                    .build();

            assertThatThrownBy(() -> invokeOnPreUpdate(chatMember))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Post must have exactly one author");
        }

        @Test
        @DisplayName("should throw IllegalStateException on pre-update when neither author is set")
        void shouldThrowOnPreUpdateWhenNeitherAuthorSet() {
            ChatMember chatMember = ChatMember.builder()
                    .chat(testChat)
                    .user(null)
                    .persona(null)
                    .build();

            assertThatThrownBy(() -> invokeOnPreUpdate(chatMember))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Post must have exactly one author");
        }
    }

    @Nested
    @DisplayName("builder and field mapping")
    class BuilderAndFieldMapping {

        @Test
        @DisplayName("should correctly map all fields via builder")
        void shouldCorrectlyMapFieldsViaBuilder() {
            ChatMember chatMember = ChatMember.builder()
                    .id(42L)
                    .chat(testChat)
                    .user(testUser)
                    .persona(null)
                    .build();

            assertThat(chatMember.getId()).isEqualTo(42L);
            assertThat(chatMember.getChat()).isEqualTo(testChat);
            assertThat(chatMember.getUser()).isEqualTo(testUser);
            assertThat(chatMember.getPersona()).isNull();
        }

        @Test
        @DisplayName("should allow setting persona via builder")
        void shouldAllowSettingPersonaViaBuilder() {
            ChatMember chatMember = ChatMember.builder()
                    .id(99L)
                    .chat(testChat)
                    .persona(testPersona)
                    .build();

            assertThat(chatMember.getId()).isEqualTo(99L);
            assertThat(chatMember.getPersona()).isEqualTo(testPersona);
            assertThat(chatMember.getUser()).isNull();
        }

        @Test
        @DisplayName("should support no-args constructor")
        void shouldSupportNoArgsConstructor() {
            ChatMember chatMember = new ChatMember();

            assertThat(chatMember.getId()).isNull();
            assertThat(chatMember.getChat()).isNull();
            assertThat(chatMember.getUser()).isNull();
            assertThat(chatMember.getPersona()).isNull();
            assertThat(chatMember.getJoinedAt()).isNull();
        }

        @Test
        @DisplayName("should support setter methods from @Data annotation")
        void shouldSupportSetterMethods() {
            ChatMember chatMember = new ChatMember();
            chatMember.setId(5L);
            chatMember.setChat(testChat);
            chatMember.setUser(testUser);

            assertThat(chatMember.getId()).isEqualTo(5L);
            assertThat(chatMember.getChat()).isEqualTo(testChat);
            assertThat(chatMember.getUser()).isEqualTo(testUser);
        }

        @Test
        @DisplayName("should default joinedAt to null when not set via builder")
        void shouldDefaultJoinedAtToNull() {
            ChatMember chatMember = ChatMember.builder()
                    .chat(testChat)
                    .user(testUser)
                    .build();

            assertThat(chatMember.getJoinedAt()).isNull();
        }

        @Test
        @DisplayName("should reference correct chat")
        void shouldReferenceCorrectChat() {
            ChatMember chatMember = ChatMember.builder()
                    .chat(testChat)
                    .user(testUser)
                    .build();

            assertThat(chatMember.getChat()).isNotNull();
            assertThat(chatMember.getChat().getId()).isEqualTo(1L);
            assertThat(chatMember.getChat().getChatName()).isEqualTo("Test Chat");
        }
    }
}
