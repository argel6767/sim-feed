package app.sim_feed.user_service.users.models;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class UserDtoTest {

    private User testUser;
    private final String CLERK_ID = "clerk_user_123";
    private final String USERNAME = "testuser";
    private final String BIO = "This is a test bio";

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .clerkId(CLERK_ID)
                .username(USERNAME)
                .bio(BIO)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("of (factory method)")
    class OfFactoryMethod {

        @Test
        @DisplayName("should map clerkId to id field")
        void shouldMapClerkIdToIdField() {
            UserDto dto = UserDto.of(testUser);

            assertThat(dto.id()).isEqualTo(CLERK_ID);
        }

        @Test
        @DisplayName("should map username correctly")
        void shouldMapUsernameCorrectly() {
            UserDto dto = UserDto.of(testUser);

            assertThat(dto.username()).isEqualTo(USERNAME);
        }

        @Test
        @DisplayName("should map bio correctly")
        void shouldMapBioCorrectly() {
            UserDto dto = UserDto.of(testUser);

            assertThat(dto.bio()).isEqualTo(BIO);
        }

        @Test
        @DisplayName("should handle null bio from user")
        void shouldHandleNullBio() {
            User userWithNullBio = User.builder()
                    .clerkId(CLERK_ID)
                    .username(USERNAME)
                    .bio(null)
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();

            UserDto dto = UserDto.of(userWithNullBio);

            assertThat(dto.bio()).isNull();
        }

        @Test
        @DisplayName("should handle empty bio from user")
        void shouldHandleEmptyBio() {
            User userWithEmptyBio = User.builder()
                    .clerkId(CLERK_ID)
                    .username(USERNAME)
                    .bio("")
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();

            UserDto dto = UserDto.of(userWithEmptyBio);

            assertThat(dto.bio()).isEmpty();
        }

        @Test
        @DisplayName("should throw NullPointerException when user is null")
        void shouldThrowWhenUserIsNull() {
            assertThatThrownBy(() -> UserDto.of(null))
                    .isInstanceOf(NullPointerException.class);
        }

        @Test
        @DisplayName("should not include timestamps or collections from user entity")
        void shouldOnlyIncludeRelevantFields() {
            UserDto dto = UserDto.of(testUser);

            // The DTO record only has id, username, bio - verify correct mapping
            assertThat(dto.id()).isEqualTo(testUser.getClerkId());
            assertThat(dto.username()).isEqualTo(testUser.getUsername());
            assertThat(dto.bio()).isEqualTo(testUser.getBio());
        }
    }

    @Nested
    @DisplayName("record semantics")
    class RecordSemantics {

        @Test
        @DisplayName("should create instance via constructor")
        void shouldCreateViaConstructor() {
            UserDto dto = new UserDto("id_123", "myuser", "my bio");

            assertThat(dto.id()).isEqualTo("id_123");
            assertThat(dto.username()).isEqualTo("myuser");
            assertThat(dto.bio()).isEqualTo("my bio");
        }

        @Test
        @DisplayName("should be equal when all fields match")
        void shouldBeEqualWhenAllFieldsMatch() {
            UserDto dto1 = new UserDto("id_1", "user1", "bio1");
            UserDto dto2 = new UserDto("id_1", "user1", "bio1");

            assertThat(dto1).isEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when id differs")
        void shouldNotBeEqualWhenIdDiffers() {
            UserDto dto1 = new UserDto("id_1", "user1", "bio1");
            UserDto dto2 = new UserDto("id_2", "user1", "bio1");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when username differs")
        void shouldNotBeEqualWhenUsernameDiffers() {
            UserDto dto1 = new UserDto("id_1", "user1", "bio1");
            UserDto dto2 = new UserDto("id_1", "user2", "bio1");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when bio differs")
        void shouldNotBeEqualWhenBioDiffers() {
            UserDto dto1 = new UserDto("id_1", "user1", "bio1");
            UserDto dto2 = new UserDto("id_1", "user1", "bio2");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should have consistent hashCode for equal instances")
        void shouldHaveConsistentHashCode() {
            UserDto dto1 = new UserDto("id_1", "user1", "bio1");
            UserDto dto2 = new UserDto("id_1", "user1", "bio1");

            assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
        }

        @Test
        @DisplayName("should include all fields in toString")
        void shouldIncludeAllFieldsInToString() {
            UserDto dto = new UserDto("id_1", "user1", "bio1");

            String toString = dto.toString();
            assertThat(toString).contains("id_1");
            assertThat(toString).contains("user1");
            assertThat(toString).contains("bio1");
        }

        @Test
        @DisplayName("should allow null values for all fields")
        void shouldAllowNullValues() {
            UserDto dto = new UserDto(null, null, null);

            assertThat(dto.id()).isNull();
            assertThat(dto.username()).isNull();
            assertThat(dto.bio()).isNull();
        }
    }

    @Nested
    @DisplayName("of factory method round-trip")
    class RoundTrip {

        @Test
        @DisplayName("should produce consistent DTO from same user entity")
        void shouldProduceConsistentDtoFromSameUser() {
            UserDto dto1 = UserDto.of(testUser);
            UserDto dto2 = UserDto.of(testUser);

            assertThat(dto1).isEqualTo(dto2);
        }

        @Test
        @DisplayName("should produce different DTOs from different user entities")
        void shouldProduceDifferentDtosFromDifferentUsers() {
            User anotherUser = User.builder()
                    .clerkId("clerk_other_456")
                    .username("otheruser")
                    .bio("Another bio")
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();

            UserDto dto1 = UserDto.of(testUser);
            UserDto dto2 = UserDto.of(anotherUser);

            assertThat(dto1).isNotEqualTo(dto2);
        }
    }
}
