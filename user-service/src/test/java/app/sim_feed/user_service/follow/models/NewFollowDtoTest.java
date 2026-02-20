package app.sim_feed.user_service.follow.models;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class NewFollowDtoTest {

    @Nested
    @DisplayName("record semantics")
    class RecordSemantics {

        @Test
        @DisplayName("should create instance with userId only")
        void shouldCreateWithUserIdOnly() {
            NewFollowDto dto = new NewFollowDto("clerk_user_123", null);

            assertThat(dto.userId()).isEqualTo("clerk_user_123");
            assertThat(dto.personaId()).isNull();
        }

        @Test
        @DisplayName("should create instance with personaId only")
        void shouldCreateWithPersonaIdOnly() {
            NewFollowDto dto = new NewFollowDto(null, 10L);

            assertThat(dto.userId()).isNull();
            assertThat(dto.personaId()).isEqualTo(10L);
        }

        @Test
        @DisplayName("should allow both fields to be null")
        void shouldAllowBothFieldsNull() {
            NewFollowDto dto = new NewFollowDto(null, null);

            assertThat(dto.userId()).isNull();
            assertThat(dto.personaId()).isNull();
        }

        @Test
        @DisplayName("should allow both fields to be set")
        void shouldAllowBothFieldsSet() {
            NewFollowDto dto = new NewFollowDto("clerk_user_123", 10L);

            assertThat(dto.userId()).isEqualTo("clerk_user_123");
            assertThat(dto.personaId()).isEqualTo(10L);
        }

        @Test
        @DisplayName("should be equal when all fields match")
        void shouldBeEqualWhenAllFieldsMatch() {
            NewFollowDto dto1 = new NewFollowDto("clerk_user_123", null);
            NewFollowDto dto2 = new NewFollowDto("clerk_user_123", null);

            assertThat(dto1).isEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when userId differs")
        void shouldNotBeEqualWhenUserIdDiffers() {
            NewFollowDto dto1 = new NewFollowDto("clerk_user_123", null);
            NewFollowDto dto2 = new NewFollowDto("clerk_user_456", null);

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when personaId differs")
        void shouldNotBeEqualWhenPersonaIdDiffers() {
            NewFollowDto dto1 = new NewFollowDto(null, 10L);
            NewFollowDto dto2 = new NewFollowDto(null, 20L);

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should have consistent hashCode for equal instances")
        void shouldHaveConsistentHashCode() {
            NewFollowDto dto1 = new NewFollowDto("clerk_user_123", null);
            NewFollowDto dto2 = new NewFollowDto("clerk_user_123", null);

            assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
        }

        @Test
        @DisplayName("should have consistent hashCode for instances with personaId")
        void shouldHaveConsistentHashCodeWithPersonaId() {
            NewFollowDto dto1 = new NewFollowDto(null, 10L);
            NewFollowDto dto2 = new NewFollowDto(null, 10L);

            assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
        }

        @Test
        @DisplayName("should include userId in toString")
        void shouldIncludeUserIdInToString() {
            NewFollowDto dto = new NewFollowDto("clerk_user_123", null);

            assertThat(dto.toString()).contains("clerk_user_123");
        }

        @Test
        @DisplayName("should include personaId in toString")
        void shouldIncludePersonaIdInToString() {
            NewFollowDto dto = new NewFollowDto(null, 10L);

            assertThat(dto.toString()).contains("10");
        }

        @Test
        @DisplayName("should not throw on toString with all null fields")
        void shouldNotThrowOnToStringWithAllNullFields() {
            NewFollowDto dto = new NewFollowDto(null, null);

            String result = dto.toString();

            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("should not be equal to null")
        void shouldNotBeEqualToNull() {
            NewFollowDto dto = new NewFollowDto("clerk_user_123", null);

            assertThat(dto).isNotEqualTo(null);
        }

        @Test
        @DisplayName("should be equal to itself")
        void shouldBeEqualToItself() {
            NewFollowDto dto = new NewFollowDto("clerk_user_123", 10L);

            assertThat(dto).isEqualTo(dto);
        }
    }
}
