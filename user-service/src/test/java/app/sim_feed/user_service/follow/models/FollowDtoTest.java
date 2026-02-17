package app.sim_feed.user_service.follow.models;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import app.sim_feed.user_service.persona.models.Persona;
import app.sim_feed.user_service.persona.models.PersonaDto;
import app.sim_feed.user_service.users.models.User;
import app.sim_feed.user_service.users.models.UserDto;

class FollowDtoTest {

    private User followerUser;
    private User followedUser;
    private Persona followedPersona;

    private static final String FOLLOWER_ID = "clerk_follower_123";
    private static final String FOLLOWED_USER_ID = "clerk_followed_456";
    private static final Long FOLLOWED_PERSONA_ID = 10L;

    @BeforeEach
    void setUp() {
        followerUser = User.builder()
                .clerkId(FOLLOWER_ID)
                .username("follower_user")
                .bio("follower bio")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        followedUser = User.builder()
                .clerkId(FOLLOWED_USER_ID)
                .username("followed_user")
                .bio("followed bio")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        followedPersona = Persona.builder()
                .personaId(FOLLOWED_PERSONA_ID)
                .username("followed_persona")
                .bio("persona bio")
                .createdAt(OffsetDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("of (factory method)")
    class OfFactoryMethod {

        @Test
        @DisplayName("should map UserFollow with userFollowed correctly")
        void shouldMapUserFollowWithUserFollowed() {
            UserFollow userFollow = UserFollow.builder()
                    .id(1L)
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .personaFollowed(null)
                    .build();

            FollowDto dto = FollowDto.of(userFollow);

            assertThat(dto.id()).isEqualTo(1L);
            assertThat(dto.follower()).isEqualTo(UserDto.of(followerUser));
            assertThat(dto.userFollowed()).isEqualTo(UserDto.of(followedUser));
            assertThat(dto.personaFollowed()).isNull();
        }

        @Test
        @DisplayName("should map UserFollow with personaFollowed correctly")
        void shouldMapUserFollowWithPersonaFollowed() {
            UserFollow userFollow = UserFollow.builder()
                    .id(2L)
                    .follower(followerUser)
                    .userFollowed(null)
                    .personaFollowed(followedPersona)
                    .build();

            FollowDto dto = FollowDto.of(userFollow);

            assertThat(dto.id()).isEqualTo(2L);
            assertThat(dto.follower()).isEqualTo(UserDto.of(followerUser));
            assertThat(dto.userFollowed()).isNull();
            assertThat(dto.personaFollowed()).isEqualTo(PersonaDto.of(followedPersona));
        }

        @Test
        @DisplayName("should map follower id correctly")
        void shouldMapFollowerIdCorrectly() {
            UserFollow userFollow = UserFollow.builder()
                    .id(1L)
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            FollowDto dto = FollowDto.of(userFollow);

            assertThat(dto.follower().id()).isEqualTo(FOLLOWER_ID);
        }

        @Test
        @DisplayName("should map followed user id correctly")
        void shouldMapFollowedUserIdCorrectly() {
            UserFollow userFollow = UserFollow.builder()
                    .id(1L)
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            FollowDto dto = FollowDto.of(userFollow);

            assertThat(dto.userFollowed().id()).isEqualTo(FOLLOWED_USER_ID);
        }

        @Test
        @DisplayName("should map followed persona id correctly")
        void shouldMapFollowedPersonaIdCorrectly() {
            UserFollow userFollow = UserFollow.builder()
                    .id(2L)
                    .follower(followerUser)
                    .personaFollowed(followedPersona)
                    .build();

            FollowDto dto = FollowDto.of(userFollow);

            assertThat(dto.personaFollowed().personaId()).isEqualTo(FOLLOWED_PERSONA_ID);
        }

        @Test
        @DisplayName("should throw NullPointerException when userFollow is null")
        void shouldThrowWhenUserFollowIsNull() {
            assertThatThrownBy(() -> FollowDto.of(null))
                    .isInstanceOf(NullPointerException.class);
        }

        @Test
        @DisplayName("should map id field from UserFollow entity")
        void shouldMapIdFromEntity() {
            UserFollow userFollow = UserFollow.builder()
                    .id(42L)
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            FollowDto dto = FollowDto.of(userFollow);

            assertThat(dto.id()).isEqualTo(42L);
        }
    }

    @Nested
    @DisplayName("record semantics")
    class RecordSemantics {

        @Test
        @DisplayName("should create instance via constructor")
        void shouldCreateViaConstructor() {
            UserDto followerDto = new UserDto(FOLLOWER_ID, "follower_user", "follower bio");
            UserDto followedDto = new UserDto(FOLLOWED_USER_ID, "followed_user", "followed bio");

            FollowDto dto = new FollowDto(1L, followerDto, followedDto, null);

            assertThat(dto.id()).isEqualTo(1L);
            assertThat(dto.follower()).isEqualTo(followerDto);
            assertThat(dto.userFollowed()).isEqualTo(followedDto);
            assertThat(dto.personaFollowed()).isNull();
        }

        @Test
        @DisplayName("should create instance with personaFollowed via constructor")
        void shouldCreateWithPersonaFollowedViaConstructor() {
            UserDto followerDto = new UserDto(FOLLOWER_ID, "follower_user", "follower bio");
            PersonaDto personaDto = new PersonaDto(FOLLOWED_PERSONA_ID, "persona_user");

            FollowDto dto = new FollowDto(2L, followerDto, null, personaDto);

            assertThat(dto.id()).isEqualTo(2L);
            assertThat(dto.follower()).isEqualTo(followerDto);
            assertThat(dto.userFollowed()).isNull();
            assertThat(dto.personaFollowed()).isEqualTo(personaDto);
        }

        @Test
        @DisplayName("should be equal when all fields match")
        void shouldBeEqualWhenAllFieldsMatch() {
            UserDto followerDto = new UserDto(FOLLOWER_ID, "follower_user", "follower bio");
            UserDto followedDto = new UserDto(FOLLOWED_USER_ID, "followed_user", "followed bio");

            FollowDto dto1 = new FollowDto(1L, followerDto, followedDto, null);
            FollowDto dto2 = new FollowDto(1L, followerDto, followedDto, null);

            assertThat(dto1).isEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when id differs")
        void shouldNotBeEqualWhenIdDiffers() {
            UserDto followerDto = new UserDto(FOLLOWER_ID, "follower_user", "follower bio");
            UserDto followedDto = new UserDto(FOLLOWED_USER_ID, "followed_user", "followed bio");

            FollowDto dto1 = new FollowDto(1L, followerDto, followedDto, null);
            FollowDto dto2 = new FollowDto(2L, followerDto, followedDto, null);

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when follower differs")
        void shouldNotBeEqualWhenFollowerDiffers() {
            UserDto followerDto1 = new UserDto(FOLLOWER_ID, "follower_user", "follower bio");
            UserDto followerDto2 = new UserDto("clerk_different_999", "different_user", "different bio");
            UserDto followedDto = new UserDto(FOLLOWED_USER_ID, "followed_user", "followed bio");

            FollowDto dto1 = new FollowDto(1L, followerDto1, followedDto, null);
            FollowDto dto2 = new FollowDto(1L, followerDto2, followedDto, null);

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when userFollowed differs")
        void shouldNotBeEqualWhenUserFollowedDiffers() {
            UserDto followerDto = new UserDto(FOLLOWER_ID, "follower_user", "follower bio");
            UserDto followedDto1 = new UserDto(FOLLOWED_USER_ID, "followed_user", "followed bio");
            UserDto followedDto2 = new UserDto("clerk_other_789", "other_user", "other bio");

            FollowDto dto1 = new FollowDto(1L, followerDto, followedDto1, null);
            FollowDto dto2 = new FollowDto(1L, followerDto, followedDto2, null);

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when personaFollowed differs")
        void shouldNotBeEqualWhenPersonaFollowedDiffers() {
            UserDto followerDto = new UserDto(FOLLOWER_ID, "follower_user", "follower bio");
            PersonaDto personaDto1 = new PersonaDto(10L, "persona_a");
            PersonaDto personaDto2 = new PersonaDto(20L, "persona_b");

            FollowDto dto1 = new FollowDto(1L, followerDto, null, personaDto1);
            FollowDto dto2 = new FollowDto(1L, followerDto, null, personaDto2);

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should have consistent hashCode for equal instances")
        void shouldHaveConsistentHashCode() {
            UserDto followerDto = new UserDto(FOLLOWER_ID, "follower_user", "follower bio");
            UserDto followedDto = new UserDto(FOLLOWED_USER_ID, "followed_user", "followed bio");

            FollowDto dto1 = new FollowDto(1L, followerDto, followedDto, null);
            FollowDto dto2 = new FollowDto(1L, followerDto, followedDto, null);

            assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
        }

        @Test
        @DisplayName("should include all fields in toString")
        void shouldIncludeAllFieldsInToString() {
            UserDto followerDto = new UserDto(FOLLOWER_ID, "follower_user", "follower bio");
            UserDto followedDto = new UserDto(FOLLOWED_USER_ID, "followed_user", "followed bio");

            FollowDto dto = new FollowDto(1L, followerDto, followedDto, null);

            String toString = dto.toString();
            assertThat(toString).contains("1");
            assertThat(toString).contains(FOLLOWER_ID);
        }

        @Test
        @DisplayName("should allow null values for nullable fields")
        void shouldAllowNullValues() {
            FollowDto dto = new FollowDto(null, null, null, null);

            assertThat(dto.id()).isNull();
            assertThat(dto.follower()).isNull();
            assertThat(dto.userFollowed()).isNull();
            assertThat(dto.personaFollowed()).isNull();
        }
    }

    @Nested
    @DisplayName("of factory method round-trip")
    class RoundTrip {

        @Test
        @DisplayName("should produce consistent DTO from same UserFollow entity")
        void shouldProduceConsistentDtoFromSameEntity() {
            UserFollow userFollow = UserFollow.builder()
                    .id(1L)
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            FollowDto dto1 = FollowDto.of(userFollow);
            FollowDto dto2 = FollowDto.of(userFollow);

            assertThat(dto1).isEqualTo(dto2);
        }

        @Test
        @DisplayName("should produce different DTOs from different UserFollow entities")
        void shouldProduceDifferentDtosFromDifferentEntities() {
            UserFollow follow1 = UserFollow.builder()
                    .id(1L)
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            UserFollow follow2 = UserFollow.builder()
                    .id(2L)
                    .follower(followerUser)
                    .personaFollowed(followedPersona)
                    .build();

            FollowDto dto1 = FollowDto.of(follow1);
            FollowDto dto2 = FollowDto.of(follow2);

            assertThat(dto1).isNotEqualTo(dto2);
        }
    }
}
