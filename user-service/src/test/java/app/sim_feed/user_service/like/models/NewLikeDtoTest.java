package app.sim_feed.user_service.like.models;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class NewLikeDtoTest {

    @Nested
    @DisplayName("record semantics")
    class RecordSemantics {

        @Test
        @DisplayName("should create instance with postId only")
        void shouldCreateWithPostIdOnly() {
            NewLikeDto dto = new NewLikeDto(1L, null, null);

            assertThat(dto.postId()).isEqualTo(1L);
            assertThat(dto.personaId()).isNull();
            assertThat(dto.userId()).isNull();
        }

        @Test
        @DisplayName("should create instance with postId and userId")
        void shouldCreateWithPostIdAndUserId() {
            NewLikeDto dto = new NewLikeDto(1L, null, "clerk_user_123");

            assertThat(dto.postId()).isEqualTo(1L);
            assertThat(dto.personaId()).isNull();
            assertThat(dto.userId()).isEqualTo("clerk_user_123");
        }

        @Test
        @DisplayName("should create instance with postId and personaId")
        void shouldCreateWithPostIdAndPersonaId() {
            NewLikeDto dto = new NewLikeDto(1L, 10L, null);

            assertThat(dto.postId()).isEqualTo(1L);
            assertThat(dto.personaId()).isEqualTo(10L);
            assertThat(dto.userId()).isNull();
        }

        @Test
        @DisplayName("should allow all fields to be set")
        void shouldAllowAllFieldsSet() {
            NewLikeDto dto = new NewLikeDto(1L, 10L, "clerk_user_123");

            assertThat(dto.postId()).isEqualTo(1L);
            assertThat(dto.personaId()).isEqualTo(10L);
            assertThat(dto.userId()).isEqualTo("clerk_user_123");
        }

        @Test
        @DisplayName("should allow all nullable fields to be null")
        void shouldAllowNullableFieldsToBeNull() {
            NewLikeDto dto = new NewLikeDto(1L, null, null);

            assertThat(dto.personaId()).isNull();
            assertThat(dto.userId()).isNull();
        }

        @Test
        @DisplayName("should be equal when all fields match")
        void shouldBeEqualWhenAllFieldsMatch() {
            NewLikeDto dto1 = new NewLikeDto(1L, null, "clerk_user_123");
            NewLikeDto dto2 = new NewLikeDto(1L, null, "clerk_user_123");

            assertThat(dto1).isEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when postId differs")
        void shouldNotBeEqualWhenPostIdDiffers() {
            NewLikeDto dto1 = new NewLikeDto(1L, null, "clerk_user_123");
            NewLikeDto dto2 = new NewLikeDto(2L, null, "clerk_user_123");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when personaId differs")
        void shouldNotBeEqualWhenPersonaIdDiffers() {
            NewLikeDto dto1 = new NewLikeDto(1L, 10L, null);
            NewLikeDto dto2 = new NewLikeDto(1L, 20L, null);

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when userId differs")
        void shouldNotBeEqualWhenUserIdDiffers() {
            NewLikeDto dto1 = new NewLikeDto(1L, null, "clerk_user_123");
            NewLikeDto dto2 = new NewLikeDto(1L, null, "clerk_user_456");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should have consistent hashCode for equal instances")
        void shouldHaveConsistentHashCode() {
            NewLikeDto dto1 = new NewLikeDto(1L, null, "clerk_user_123");
            NewLikeDto dto2 = new NewLikeDto(1L, null, "clerk_user_123");

            assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
        }

        @Test
        @DisplayName("should have consistent hashCode for instances with personaId")
        void shouldHaveConsistentHashCodeWithPersonaId() {
            NewLikeDto dto1 = new NewLikeDto(1L, 10L, null);
            NewLikeDto dto2 = new NewLikeDto(1L, 10L, null);

            assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
        }

        @Test
        @DisplayName("should include postId in toString")
        void shouldIncludePostIdInToString() {
            NewLikeDto dto = new NewLikeDto(42L, null, null);

            assertThat(dto.toString()).contains("42");
        }

        @Test
        @DisplayName("should include userId in toString")
        void shouldIncludeUserIdInToString() {
            NewLikeDto dto = new NewLikeDto(1L, null, "clerk_user_123");

            assertThat(dto.toString()).contains("clerk_user_123");
        }

        @Test
        @DisplayName("should include personaId in toString")
        void shouldIncludePersonaIdInToString() {
            NewLikeDto dto = new NewLikeDto(1L, 10L, null);

            assertThat(dto.toString()).contains("10");
        }

        @Test
        @DisplayName("should not throw on toString with all nullable fields null")
        void shouldNotThrowOnToStringWithNullFields() {
            NewLikeDto dto = new NewLikeDto(1L, null, null);

            String result = dto.toString();

            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("should not be equal to null")
        void shouldNotBeEqualToNull() {
            NewLikeDto dto = new NewLikeDto(1L, null, "clerk_user_123");

            assertThat(dto).isNotEqualTo(null);
        }

        @Test
        @DisplayName("should be equal to itself")
        void shouldBeEqualToItself() {
            NewLikeDto dto = new NewLikeDto(1L, 10L, "clerk_user_123");

            assertThat(dto).isEqualTo(dto);
        }
    }
}
