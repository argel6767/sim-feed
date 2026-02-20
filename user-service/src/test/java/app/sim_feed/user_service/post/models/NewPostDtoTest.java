package app.sim_feed.user_service.post.models;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class NewPostDtoTest {

    @Nested
    @DisplayName("record semantics")
    class RecordSemantics {

        @Test
        @DisplayName("should create instance via constructor")
        void shouldCreateViaConstructor() {
            NewPostDto dto = new NewPostDto("My Title", "My Body");

            assertThat(dto.title()).isEqualTo("My Title");
            assertThat(dto.body()).isEqualTo("My Body");
        }

        @Test
        @DisplayName("should be equal when all fields match")
        void shouldBeEqualWhenAllFieldsMatch() {
            NewPostDto dto1 = new NewPostDto("Title", "Body");
            NewPostDto dto2 = new NewPostDto("Title", "Body");

            assertThat(dto1).isEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when title differs")
        void shouldNotBeEqualWhenTitleDiffers() {
            NewPostDto dto1 = new NewPostDto("Title A", "Body");
            NewPostDto dto2 = new NewPostDto("Title B", "Body");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when body differs")
        void shouldNotBeEqualWhenBodyDiffers() {
            NewPostDto dto1 = new NewPostDto("Title", "Body A");
            NewPostDto dto2 = new NewPostDto("Title", "Body B");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should have consistent hashCode for equal instances")
        void shouldHaveConsistentHashCode() {
            NewPostDto dto1 = new NewPostDto("Title", "Body");
            NewPostDto dto2 = new NewPostDto("Title", "Body");

            assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
        }

        @Test
        @DisplayName("should have different hashCode for different instances")
        void shouldHaveDifferentHashCodeForDifferentInstances() {
            NewPostDto dto1 = new NewPostDto("Title A", "Body A");
            NewPostDto dto2 = new NewPostDto("Title B", "Body B");

            assertThat(dto1.hashCode()).isNotEqualTo(dto2.hashCode());
        }

        @Test
        @DisplayName("should include all fields in toString")
        void shouldIncludeAllFieldsInToString() {
            NewPostDto dto = new NewPostDto("My Title", "My Body");

            String toString = dto.toString();
            assertThat(toString).contains("My Title");
            assertThat(toString).contains("My Body");
        }

        @Test
        @DisplayName("should allow null values for all fields")
        void shouldAllowNullValues() {
            NewPostDto dto = new NewPostDto(null, null);

            assertThat(dto.title()).isNull();
            assertThat(dto.body()).isNull();
        }

        @Test
        @DisplayName("should allow empty strings")
        void shouldAllowEmptyStrings() {
            NewPostDto dto = new NewPostDto("", "");

            assertThat(dto.title()).isEmpty();
            assertThat(dto.body()).isEmpty();
        }

        @Test
        @DisplayName("should handle whitespace-only strings")
        void shouldHandleWhitespaceOnlyStrings() {
            NewPostDto dto = new NewPostDto("   ", "   ");

            assertThat(dto.title()).isEqualTo("   ");
            assertThat(dto.body()).isEqualTo("   ");
        }

        @Test
        @DisplayName("should handle very long strings")
        void shouldHandleVeryLongStrings() {
            String longTitle = "a".repeat(1000);
            String longBody = "b".repeat(10000);
            NewPostDto dto = new NewPostDto(longTitle, longBody);

            assertThat(dto.title()).isEqualTo(longTitle);
            assertThat(dto.title()).hasSize(1000);
            assertThat(dto.body()).isEqualTo(longBody);
            assertThat(dto.body()).hasSize(10000);
        }

        @Test
        @DisplayName("should not be equal to null")
        void shouldNotBeEqualToNull() {
            NewPostDto dto = new NewPostDto("Title", "Body");

            assertThat(dto).isNotEqualTo(null);
        }

        @Test
        @DisplayName("should be equal to itself")
        void shouldBeEqualToItself() {
            NewPostDto dto = new NewPostDto("Title", "Body");

            assertThat(dto).isEqualTo(dto);
        }

        @Test
        @DisplayName("two instances with null fields should be equal")
        void twoInstancesWithNullFieldsShouldBeEqual() {
            NewPostDto dto1 = new NewPostDto(null, null);
            NewPostDto dto2 = new NewPostDto(null, null);

            assertThat(dto1).isEqualTo(dto2);
            assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
        }

        @Test
        @DisplayName("should handle special characters in strings")
        void shouldHandleSpecialCharacters() {
            NewPostDto dto = new NewPostDto("Héllo Wörld! 🌍", "Bödy with spëcial chars: <>&\"'");

            assertThat(dto.title()).isEqualTo("Héllo Wörld! 🌍");
            assertThat(dto.body()).isEqualTo("Bödy with spëcial chars: <>&\"'");
        }
    }
}
