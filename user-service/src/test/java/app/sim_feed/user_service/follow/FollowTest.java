package app.sim_feed.user_service.follow;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import app.sim_feed.user_service.persona.Persona;

class FollowTest {

    private Persona followerPersona;
    private Persona followedPersona;

    @BeforeEach
    void setUp() {
        followerPersona = Persona.builder()
                .personaId(1L)
                .bio("Follower bio")
                .username("follower_persona")
                .createdAt(OffsetDateTime.now())
                .build();

        followedPersona = Persona.builder()
                .personaId(2L)
                .bio("Followed bio")
                .username("followed_persona")
                .createdAt(OffsetDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("builder")
    class Builder {

        @Test
        @DisplayName("should correctly set all fields via builder")
        void shouldCorrectlySetAllFields() {
            OffsetDateTime now = OffsetDateTime.now();
            Follow follow = Follow.builder()
                    .id(1L)
                    .follower(followerPersona)
                    .followed(followedPersona)
                    .createdAt(now)
                    .build();

            assertThat(follow.getId()).isEqualTo(1L);
            assertThat(follow.getFollower()).isEqualTo(followerPersona);
            assertThat(follow.getFollowed()).isEqualTo(followedPersona);
            assertThat(follow.getCreatedAt()).isEqualTo(now);
        }

        @Test
        @DisplayName("should allow null id for unsaved entity")
        void shouldAllowNullId() {
            Follow follow = Follow.builder()
                    .follower(followerPersona)
                    .followed(followedPersona)
                    .build();

            assertThat(follow.getId()).isNull();
        }

        @Test
        @DisplayName("should default createdAt to null when not set via builder")
        void shouldDefaultCreatedAtToNull() {
            Follow follow = Follow.builder()
                    .follower(followerPersona)
                    .followed(followedPersona)
                    .build();

            assertThat(follow.getCreatedAt()).isNull();
        }

        @Test
        @DisplayName("should correctly reference follower persona")
        void shouldCorrectlyReferenceFollowerPersona() {
            Follow follow = Follow.builder()
                    .follower(followerPersona)
                    .followed(followedPersona)
                    .build();

            assertThat(follow.getFollower()).isNotNull();
            assertThat(follow.getFollower().getPersonaId()).isEqualTo(1L);
            assertThat(follow.getFollower().getUsername()).isEqualTo("follower_persona");
        }

        @Test
        @DisplayName("should correctly reference followed persona")
        void shouldCorrectlyReferenceFollowedPersona() {
            Follow follow = Follow.builder()
                    .follower(followerPersona)
                    .followed(followedPersona)
                    .build();

            assertThat(follow.getFollowed()).isNotNull();
            assertThat(follow.getFollowed().getPersonaId()).isEqualTo(2L);
            assertThat(follow.getFollowed().getUsername()).isEqualTo("followed_persona");
        }

        @Test
        @DisplayName("should allow same persona as both follower and followed (self-follow)")
        void shouldAllowSelfFollow() {
            Follow follow = Follow.builder()
                    .follower(followerPersona)
                    .followed(followerPersona)
                    .build();

            assertThat(follow.getFollower()).isEqualTo(follow.getFollowed());
        }
    }

    @Nested
    @DisplayName("no-args constructor")
    class NoArgsConstructor {

        @Test
        @DisplayName("should create instance with all fields null")
        void shouldCreateInstanceWithAllFieldsNull() {
            Follow follow = new Follow();

            assertThat(follow.getId()).isNull();
            assertThat(follow.getFollower()).isNull();
            assertThat(follow.getFollowed()).isNull();
            assertThat(follow.getCreatedAt()).isNull();
        }
    }

    @Nested
    @DisplayName("all-args constructor")
    class AllArgsConstructor {

        @Test
        @DisplayName("should create instance with all fields populated")
        void shouldCreateInstanceWithAllFields() {
            OffsetDateTime now = OffsetDateTime.now();
            Follow follow = new Follow(10L, followerPersona, followedPersona, now);

            assertThat(follow.getId()).isEqualTo(10L);
            assertThat(follow.getFollower()).isEqualTo(followerPersona);
            assertThat(follow.getFollowed()).isEqualTo(followedPersona);
            assertThat(follow.getCreatedAt()).isEqualTo(now);
        }

        @Test
        @DisplayName("should allow null values in all-args constructor")
        void shouldAllowNullValuesInAllArgsConstructor() {
            Follow follow = new Follow(null, null, null, null);

            assertThat(follow.getId()).isNull();
            assertThat(follow.getFollower()).isNull();
            assertThat(follow.getFollowed()).isNull();
            assertThat(follow.getCreatedAt()).isNull();
        }
    }

    @Nested
    @DisplayName("setters (@Data)")
    class Setters {

        @Test
        @DisplayName("should update id via setter")
        void shouldUpdateIdViaSetter() {
            Follow follow = new Follow();

            follow.setId(5L);

            assertThat(follow.getId()).isEqualTo(5L);
        }

        @Test
        @DisplayName("should update follower via setter")
        void shouldUpdateFollowerViaSetter() {
            Follow follow = new Follow();

            follow.setFollower(followerPersona);

            assertThat(follow.getFollower()).isEqualTo(followerPersona);
        }

        @Test
        @DisplayName("should update followed via setter")
        void shouldUpdateFollowedViaSetter() {
            Follow follow = new Follow();

            follow.setFollowed(followedPersona);

            assertThat(follow.getFollowed()).isEqualTo(followedPersona);
        }

        @Test
        @DisplayName("should update createdAt via setter")
        void shouldUpdateCreatedAtViaSetter() {
            Follow follow = new Follow();
            OffsetDateTime now = OffsetDateTime.now();

            follow.setCreatedAt(now);

            assertThat(follow.getCreatedAt()).isEqualTo(now);
        }

        @Test
        @DisplayName("should allow replacing follower with different persona")
        void shouldAllowReplacingFollower() {
            Follow follow = Follow.builder()
                    .follower(followerPersona)
                    .followed(followedPersona)
                    .build();

            Persona newFollower = Persona.builder()
                    .personaId(99L)
                    .bio("New follower")
                    .username("new_follower")
                    .createdAt(OffsetDateTime.now())
                    .build();

            follow.setFollower(newFollower);

            assertThat(follow.getFollower().getPersonaId()).isEqualTo(99L);
            assertThat(follow.getFollower().getUsername()).isEqualTo("new_follower");
        }

        @Test
        @DisplayName("should allow setting follower to null")
        void shouldAllowSettingFollowerToNull() {
            Follow follow = Follow.builder()
                    .follower(followerPersona)
                    .followed(followedPersona)
                    .build();

            follow.setFollower(null);

            assertThat(follow.getFollower()).isNull();
        }

        @Test
        @DisplayName("should allow setting followed to null")
        void shouldAllowSettingFollowedToNull() {
            Follow follow = Follow.builder()
                    .follower(followerPersona)
                    .followed(followedPersona)
                    .build();

            follow.setFollowed(null);

            assertThat(follow.getFollowed()).isNull();
        }
    }

    @Nested
    @DisplayName("equals and hashCode (@Data)")
    class EqualsAndHashCode {

        @Test
        @DisplayName("should be equal when all fields match")
        void shouldBeEqualWhenAllFieldsMatch() {
            OffsetDateTime now = OffsetDateTime.now();
            Follow f1 = Follow.builder()
                    .id(1L)
                    .follower(followerPersona)
                    .followed(followedPersona)
                    .createdAt(now)
                    .build();
            Follow f2 = Follow.builder()
                    .id(1L)
                    .follower(followerPersona)
                    .followed(followedPersona)
                    .createdAt(now)
                    .build();

            assertThat(f1).isEqualTo(f2);
            assertThat(f1.hashCode()).isEqualTo(f2.hashCode());
        }

        @Test
        @DisplayName("should not be equal when id differs")
        void shouldNotBeEqualWhenIdDiffers() {
            Follow f1 = Follow.builder().id(1L).follower(followerPersona).followed(followedPersona).build();
            Follow f2 = Follow.builder().id(2L).follower(followerPersona).followed(followedPersona).build();

            assertThat(f1).isNotEqualTo(f2);
        }

        @Test
        @DisplayName("should not be equal when follower differs")
        void shouldNotBeEqualWhenFollowerDiffers() {
            Persona anotherPersona = Persona.builder()
                    .personaId(99L)
                    .bio("Another")
                    .username("another")
                    .createdAt(OffsetDateTime.now())
                    .build();

            Follow f1 = Follow.builder().id(1L).follower(followerPersona).followed(followedPersona).build();
            Follow f2 = Follow.builder().id(1L).follower(anotherPersona).followed(followedPersona).build();

            assertThat(f1).isNotEqualTo(f2);
        }

        @Test
        @DisplayName("should not be equal when followed differs")
        void shouldNotBeEqualWhenFollowedDiffers() {
            Persona anotherPersona = Persona.builder()
                    .personaId(99L)
                    .bio("Another")
                    .username("another")
                    .createdAt(OffsetDateTime.now())
                    .build();

            Follow f1 = Follow.builder().id(1L).follower(followerPersona).followed(followedPersona).build();
            Follow f2 = Follow.builder().id(1L).follower(followerPersona).followed(anotherPersona).build();

            assertThat(f1).isNotEqualTo(f2);
        }

        @Test
        @DisplayName("should not be equal to null")
        void shouldNotBeEqualToNull() {
            Follow follow = Follow.builder().id(1L).follower(followerPersona).followed(followedPersona).build();

            assertThat(follow).isNotEqualTo(null);
        }

        @Test
        @DisplayName("should be equal to itself")
        void shouldBeEqualToItself() {
            Follow follow = Follow.builder().id(1L).follower(followerPersona).followed(followedPersona).build();

            assertThat(follow).isEqualTo(follow);
        }

        @Test
        @DisplayName("two empty follows should be equal")
        void twoEmptyFollowsShouldBeEqual() {
            Follow f1 = new Follow();
            Follow f2 = new Follow();

            assertThat(f1).isEqualTo(f2);
            assertThat(f1.hashCode()).isEqualTo(f2.hashCode());
        }
    }

    @Nested
    @DisplayName("toString (@Data)")
    class ToStringTest {

        @Test
        @DisplayName("should include id in toString")
        void shouldIncludeIdInToString() {
            Follow follow = Follow.builder()
                    .id(42L)
                    .follower(followerPersona)
                    .followed(followedPersona)
                    .build();

            assertThat(follow.toString()).contains("42");
        }

        @Test
        @DisplayName("should not throw on toString with null fields")
        void shouldNotThrowOnToStringWithNullFields() {
            Follow follow = new Follow();

            String result = follow.toString();

            assertThat(result).isNotNull();
        }
    }
}
