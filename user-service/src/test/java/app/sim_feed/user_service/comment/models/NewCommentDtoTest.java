package app.sim_feed.user_service.comment.models;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class NewCommentDtoTest {

    @Nested
    @DisplayName("record semantics")
    class RecordSemantics {

        @Test
        @DisplayName("should create instance with postId and body")
        void shouldCreateWithPostIdAndBody() {
            NewCommentDto dto = new NewCommentDto(1L, "This is a comment");

            assertThat(dto.postId()).isEqualTo(1L);
            assertThat(dto.body()).isEqualTo("This is a comment");
        }

        @Test
        @DisplayName("should allow null body")
        void shouldAllowNullBody() {
            NewCommentDto dto = new NewCommentDto(1L, null);

            assertThat(dto.postId()).isEqualTo(1L);
            assertThat(dto.body()).isNull();
        }

        @Test
        @DisplayName("should allow null postId")
        void shouldAllowNullPostId() {
            NewCommentDto dto = new NewCommentDto(null, "Some body");

            assertThat(dto.postId()).isNull();
            assertThat(dto.body()).isEqualTo("Some body");
        }

        @Test
        @DisplayName("should allow both fields to be null")
        void shouldAllowBothFieldsNull() {
            NewCommentDto dto = new NewCommentDto(null, null);

            assertThat(dto.postId()).isNull();
            assertThat(dto.body()).isNull();
        }

        @Test
        @DisplayName("should be equal when all fields match")
        void shouldBeEqualWhenAllFieldsMatch() {
            NewCommentDto dto1 = new NewCommentDto(1L, "Hello");
            NewCommentDto dto2 = new NewCommentDto(1L, "Hello");

            assertThat(dto1).isEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when postId differs")
        void shouldNotBeEqualWhenPostIdDiffers() {
            NewCommentDto dto1 = new NewCommentDto(1L, "Hello");
            NewCommentDto dto2 = new NewCommentDto(2L, "Hello");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when body differs")
        void shouldNotBeEqualWhenBodyDiffers() {
            NewCommentDto dto1 = new NewCommentDto(1L, "Hello");
            NewCommentDto dto2 = new NewCommentDto(1L, "World");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should have consistent hashCode for equal instances")
        void shouldHaveConsistentHashCode() {
            NewCommentDto dto1 = new NewCommentDto(1L, "Hello");
            NewCommentDto dto2 = new NewCommentDto(1L, "Hello");

            assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
        }

        @Test
        @DisplayName("should include postId in toString")
        void shouldIncludePostIdInToString() {
            NewCommentDto dto = new NewCommentDto(42L, "Some body");

            assertThat(dto.toString()).contains("42");
        }

        @Test
        @DisplayName("should include body in toString")
        void shouldIncludeBodyInToString() {
            NewCommentDto dto = new NewCommentDto(1L, "my comment body");

            assertThat(dto.toString()).contains("my comment body");
        }

        @Test
        @DisplayName("should not throw on toString with all null fields")
        void shouldNotThrowOnToStringWithAllNullFields() {
            NewCommentDto dto = new NewCommentDto(null, null);

            String result = dto.toString();

            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("should not be equal to null")
        void shouldNotBeEqualToNull() {
            NewCommentDto dto = new NewCommentDto(1L, "Hello");

            assertThat(dto).isNotEqualTo(null);
        }

        @Test
        @DisplayName("should be equal to itself")
        void shouldBeEqualToItself() {
            NewCommentDto dto = new NewCommentDto(1L, "Hello");

            assertThat(dto).isEqualTo(dto);
        }

        @Test
        @DisplayName("should accept empty string body")
        void shouldAcceptEmptyStringBody() {
            NewCommentDto dto = new NewCommentDto(1L, "");

            assertThat(dto.body()).isEmpty();
        }

        @Test
        @DisplayName("should accept body with exactly 1000 characters")
        void shouldAcceptBodyWithExactly1000Characters() {
            String longBody = "a".repeat(1000);
            NewCommentDto dto = new NewCommentDto(1L, longBody);

            assertThat(dto.body()).hasSize(1000);
        }
    }
}
