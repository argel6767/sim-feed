package app.sim_feed.user_service.chats;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class ChatTest {

    @Nested
    @DisplayName("no-args constructor")
    class NoArgsConstructor {

        @Test
        @DisplayName("should create instance with all fields null")
        void shouldCreateInstanceWithAllFieldsNull() {
            Chat chat = new Chat();

            assertThat(chat.getId()).isNull();
            assertThat(chat.getChatName()).isNull();
            assertThat(chat.getCreatorId()).isNull();
            assertThat(chat.getMembers()).isNull();
            assertThat(chat.getCreatedAt()).isNull();
            assertThat(chat.getUpdatedAt()).isNull();
        }
    }

    @Nested
    @DisplayName("all-args constructor")
    class AllArgsConstructor {

        @Test
        @DisplayName("should create instance with all fields populated")
        void shouldCreateInstanceWithAllFields() {
            LocalDateTime now = LocalDateTime.now();
            Set<ChatMember> members = new HashSet<>();
            Chat chat = new Chat(1L, "Test Chat", "clerk_user_123", members, now, now);

            assertThat(chat.getId()).isEqualTo(1L);
            assertThat(chat.getChatName()).isEqualTo("Test Chat");
            assertThat(chat.getCreatorId()).isEqualTo("clerk_user_123");
            assertThat(chat.getMembers()).isNotNull().isEmpty();
            assertThat(chat.getCreatedAt()).isEqualTo(now);
            assertThat(chat.getUpdatedAt()).isEqualTo(now);
        }

        @Test
        @DisplayName("should allow null values in all-args constructor")
        void shouldAllowNullValues() {
            Chat chat = new Chat(null, null, null, null, null, null);

            assertThat(chat.getId()).isNull();
            assertThat(chat.getChatName()).isNull();
            assertThat(chat.getCreatorId()).isNull();
            assertThat(chat.getMembers()).isNull();
            assertThat(chat.getCreatedAt()).isNull();
            assertThat(chat.getUpdatedAt()).isNull();
        }
    }

    @Nested
    @DisplayName("setters and getters (@Data)")
    class SettersAndGetters {

        @Test
        @DisplayName("should update id via setter")
        void shouldUpdateIdViaSetter() {
            Chat chat = new Chat();

            chat.setId(42L);

            assertThat(chat.getId()).isEqualTo(42L);
        }

        @Test
        @DisplayName("should update chatName via setter")
        void shouldUpdateChatNameViaSetter() {
            Chat chat = new Chat();

            chat.setChatName("My Chat Room");

            assertThat(chat.getChatName()).isEqualTo("My Chat Room");
        }

        @Test
        @DisplayName("should update creatorId via setter")
        void shouldUpdateCreatorIdViaSetter() {
            Chat chat = new Chat();

            chat.setCreatorId("clerk_creator_123");

            assertThat(chat.getCreatorId()).isEqualTo("clerk_creator_123");
        }

        @Test
        @DisplayName("should update members via setter")
        void shouldUpdateMembersViaSetter() {
            Chat chat = new Chat();
            Set<ChatMember> members = new HashSet<>();

            chat.setMembers(members);

            assertThat(chat.getMembers()).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("should update createdAt via setter")
        void shouldUpdateCreatedAtViaSetter() {
            Chat chat = new Chat();
            LocalDateTime now = LocalDateTime.now();

            chat.setCreatedAt(now);

            assertThat(chat.getCreatedAt()).isEqualTo(now);
        }

        @Test
        @DisplayName("should update updatedAt via setter")
        void shouldUpdateUpdatedAtViaSetter() {
            Chat chat = new Chat();
            LocalDateTime now = LocalDateTime.now();

            chat.setUpdatedAt(now);

            assertThat(chat.getUpdatedAt()).isEqualTo(now);
        }

        @Test
        @DisplayName("should allow setting chatName to empty string")
        void shouldAllowEmptyChatName() {
            Chat chat = new Chat();

            chat.setChatName("");

            assertThat(chat.getChatName()).isEmpty();
        }

        @Test
        @DisplayName("should allow setting creatorId to null")
        void shouldAllowNullCreatorId() {
            Chat chat = new Chat();
            chat.setCreatorId("clerk_123");

            chat.setCreatorId(null);

            assertThat(chat.getCreatorId()).isNull();
        }

        @Test
        @DisplayName("should allow replacing members set")
        void shouldAllowReplacingMembers() {
            Chat chat = new Chat();
            Set<ChatMember> firstSet = new HashSet<>();
            chat.setMembers(firstSet);

            Set<ChatMember> secondSet = new HashSet<>();
            chat.setMembers(secondSet);

            assertThat(chat.getMembers()).isSameAs(secondSet);
        }
    }

    @Nested
    @DisplayName("equals and hashCode (@Data)")
    class EqualsAndHashCode {

        @Test
        @DisplayName("should be equal when all fields match")
        void shouldBeEqualWhenAllFieldsMatch() {
            LocalDateTime now = LocalDateTime.now();
            Chat chat1 = new Chat(1L, "Chat", "creator_1", null, now, now);
            Chat chat2 = new Chat(1L, "Chat", "creator_1", null, now, now);

            assertThat(chat1).isEqualTo(chat2);
            assertThat(chat1.hashCode()).isEqualTo(chat2.hashCode());
        }

        @Test
        @DisplayName("should not be equal when id differs")
        void shouldNotBeEqualWhenIdDiffers() {
            LocalDateTime now = LocalDateTime.now();
            Chat chat1 = new Chat(1L, "Chat", "creator_1", null, now, now);
            Chat chat2 = new Chat(2L, "Chat", "creator_1", null, now, now);

            assertThat(chat1).isNotEqualTo(chat2);
        }

        @Test
        @DisplayName("should not be equal when chatName differs")
        void shouldNotBeEqualWhenChatNameDiffers() {
            LocalDateTime now = LocalDateTime.now();
            Chat chat1 = new Chat(1L, "Chat A", "creator_1", null, now, now);
            Chat chat2 = new Chat(1L, "Chat B", "creator_1", null, now, now);

            assertThat(chat1).isNotEqualTo(chat2);
        }

        @Test
        @DisplayName("should not be equal when creatorId differs")
        void shouldNotBeEqualWhenCreatorIdDiffers() {
            LocalDateTime now = LocalDateTime.now();
            Chat chat1 = new Chat(1L, "Chat", "creator_1", null, now, now);
            Chat chat2 = new Chat(1L, "Chat", "creator_2", null, now, now);

            assertThat(chat1).isNotEqualTo(chat2);
        }

        @Test
        @DisplayName("should not be equal when createdAt differs")
        void shouldNotBeEqualWhenCreatedAtDiffers() {
            LocalDateTime time1 = LocalDateTime.now().minusDays(1);
            LocalDateTime time2 = LocalDateTime.now();
            Chat chat1 = new Chat(1L, "Chat", "creator_1", null, time1, time2);
            Chat chat2 = new Chat(1L, "Chat", "creator_1", null, time2, time2);

            assertThat(chat1).isNotEqualTo(chat2);
        }

        @Test
        @DisplayName("should not be equal when updatedAt differs")
        void shouldNotBeEqualWhenUpdatedAtDiffers() {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime later = now.plusHours(1);
            Chat chat1 = new Chat(1L, "Chat", "creator_1", null, now, now);
            Chat chat2 = new Chat(1L, "Chat", "creator_1", null, now, later);

            assertThat(chat1).isNotEqualTo(chat2);
        }

        @Test
        @DisplayName("should not be equal to null")
        void shouldNotBeEqualToNull() {
            Chat chat = new Chat();

            assertThat(chat).isNotEqualTo(null);
        }

        @Test
        @DisplayName("should be equal to itself")
        void shouldBeEqualToItself() {
            Chat chat = new Chat(1L, "Chat", "creator_1", null, LocalDateTime.now(), LocalDateTime.now());

            assertThat(chat).isEqualTo(chat);
        }

        @Test
        @DisplayName("two empty chats should be equal")
        void twoEmptyChatsShouldBeEqual() {
            Chat chat1 = new Chat();
            Chat chat2 = new Chat();

            assertThat(chat1).isEqualTo(chat2);
            assertThat(chat1.hashCode()).isEqualTo(chat2.hashCode());
        }
    }

    @Nested
    @DisplayName("toString (@Data)")
    class ToStringTest {

        @Test
        @DisplayName("should include id in toString")
        void shouldIncludeIdInToString() {
            Chat chat = new Chat();
            chat.setId(42L);
            chat.setChatName("Test");

            assertThat(chat.toString()).contains("42");
        }

        @Test
        @DisplayName("should include chatName in toString")
        void shouldIncludeChatNameInToString() {
            Chat chat = new Chat();
            chat.setId(1L);
            chat.setChatName("My Awesome Chat");

            assertThat(chat.toString()).contains("My Awesome Chat");
        }

        @Test
        @DisplayName("should include creatorId in toString")
        void shouldIncludeCreatorIdInToString() {
            Chat chat = new Chat();
            chat.setId(1L);
            chat.setChatName("Chat");
            chat.setCreatorId("clerk_abc_123");

            assertThat(chat.toString()).contains("clerk_abc_123");
        }

        @Test
        @DisplayName("should not throw on toString with null fields")
        void shouldNotThrowOnToStringWithNullFields() {
            Chat chat = new Chat();

            String result = chat.toString();

            assertThat(result).isNotNull();
        }
    }

    @Nested
    @DisplayName("field interactions")
    class FieldInteractions {

        @Test
        @DisplayName("should maintain independent createdAt and updatedAt")
        void shouldMaintainIndependentTimestamps() {
            LocalDateTime created = LocalDateTime.of(2024, 1, 1, 0, 0);
            LocalDateTime updated = LocalDateTime.of(2025, 6, 15, 12, 30);

            Chat chat = new Chat();
            chat.setCreatedAt(created);
            chat.setUpdatedAt(updated);

            assertThat(chat.getCreatedAt()).isEqualTo(created);
            assertThat(chat.getUpdatedAt()).isEqualTo(updated);
            assertThat(chat.getCreatedAt()).isNotEqualTo(chat.getUpdatedAt());
        }

        @Test
        @DisplayName("should allow updating updatedAt without affecting createdAt")
        void shouldAllowUpdatingUpdatedAtIndependently() {
            LocalDateTime now = LocalDateTime.now();
            Chat chat = new Chat(1L, "Chat", "creator", null, now, now);

            LocalDateTime later = now.plusHours(5);
            chat.setUpdatedAt(later);

            assertThat(chat.getCreatedAt()).isEqualTo(now);
            assertThat(chat.getUpdatedAt()).isEqualTo(later);
        }

        @Test
        @DisplayName("should handle special characters in chatName")
        void shouldHandleSpecialCharactersInChatName() {
            Chat chat = new Chat();
            chat.setChatName("Héllo Wörld! 🌍 Chat <>&\"'");

            assertThat(chat.getChatName()).isEqualTo("Héllo Wörld! 🌍 Chat <>&\"'");
        }

        @Test
        @DisplayName("should handle long chatName")
        void shouldHandleLongChatName() {
            String longName = "a".repeat(1000);
            Chat chat = new Chat();
            chat.setChatName(longName);

            assertThat(chat.getChatName()).isEqualTo(longName);
            assertThat(chat.getChatName()).hasSize(1000);
        }
    }
}
