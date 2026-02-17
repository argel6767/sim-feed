package app.sim_feed.user_service.follow.models;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Method;
import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import app.sim_feed.user_service.persona.models.Persona;
import app.sim_feed.user_service.users.models.User;

class UserFollowTest {

    private User followerUser;
    private User followedUser;
    private Persona followedPersona;

    private void invokePrePersist(UserFollow userFollow) throws Exception {
        Method method = UserFollow.class.getDeclaredMethod("prePersist");
        method.setAccessible(true);
        try {
            method.invoke(userFollow);
        } catch (java.lang.reflect.InvocationTargetException e) {
            throw (Exception) e.getCause();
        }
    }

    private void invokePreUpdate(UserFollow userFollow) throws Exception {
        Method method = UserFollow.class.getDeclaredMethod("preUpdate");
        method.setAccessible(true);
        try {
            method.invoke(userFollow);
        } catch (java.lang.reflect.InvocationTargetException e) {
            throw (Exception) e.getCause();
        }
    }

    @BeforeEach
    void setUp() {
        followerUser = User.builder()
                .clerkId("clerk_follower_123")
                .username("follower_user")
                .bio("Follower bio")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        followedUser = User.builder()
                .clerkId("clerk_followed_456")
                .username("followed_user")
                .bio("Followed bio")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        followedPersona = Persona.builder()
                .personaId(10L)
                .username("followed_persona")
                .bio("Persona bio")
                .createdAt(OffsetDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("builder")
    class Builder {

        @Test
        @DisplayName("should correctly set all fields via builder for user follow")
        void shouldCorrectlySetAllFieldsForUserFollow() {
            OffsetDateTime now = OffsetDateTime.now();
            UserFollow follow = UserFollow.builder()
                    .id(1L)
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            assertThat(follow.getId()).isEqualTo(1L);
            assertThat(follow.getFollower()).isEqualTo(followerUser);
            assertThat(follow.getUserFollowed()).isEqualTo(followedUser);
            assertThat(follow.getPersonaFollowed()).isNull();
            assertThat(follow.getCreatedAt()).isEqualTo(now);
            assertThat(follow.getUpdatedAt()).isEqualTo(now);
        }

        @Test
        @DisplayName("should correctly set all fields via builder for persona follow")
        void shouldCorrectlySetAllFieldsForPersonaFollow() {
            OffsetDateTime now = OffsetDateTime.now();
            UserFollow follow = UserFollow.builder()
                    .id(2L)
                    .follower(followerUser)
                    .personaFollowed(followedPersona)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            assertThat(follow.getId()).isEqualTo(2L);
            assertThat(follow.getFollower()).isEqualTo(followerUser);
            assertThat(follow.getUserFollowed()).isNull();
            assertThat(follow.getPersonaFollowed()).isEqualTo(followedPersona);
            assertThat(follow.getCreatedAt()).isEqualTo(now);
            assertThat(follow.getUpdatedAt()).isEqualTo(now);
        }

        @Test
        @DisplayName("should allow null id for unsaved entity")
        void shouldAllowNullId() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            assertThat(follow.getId()).isNull();
        }

        @Test
        @DisplayName("should default timestamps to null when not set via builder")
        void shouldDefaultTimestampsToNull() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            assertThat(follow.getCreatedAt()).isNull();
            assertThat(follow.getUpdatedAt()).isNull();
        }

        @Test
        @DisplayName("should correctly reference follower user")
        void shouldCorrectlyReferenceFollowerUser() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            assertThat(follow.getFollower()).isNotNull();
            assertThat(follow.getFollower().getClerkId()).isEqualTo("clerk_follower_123");
            assertThat(follow.getFollower().getUsername()).isEqualTo("follower_user");
        }

        @Test
        @DisplayName("should correctly reference followed user")
        void shouldCorrectlyReferenceFollowedUser() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            assertThat(follow.getUserFollowed()).isNotNull();
            assertThat(follow.getUserFollowed().getClerkId()).isEqualTo("clerk_followed_456");
            assertThat(follow.getUserFollowed().getUsername()).isEqualTo("followed_user");
        }

        @Test
        @DisplayName("should correctly reference followed persona")
        void shouldCorrectlyReferenceFollowedPersona() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .personaFollowed(followedPersona)
                    .build();

            assertThat(follow.getPersonaFollowed()).isNotNull();
            assertThat(follow.getPersonaFollowed().getPersonaId()).isEqualTo(10L);
            assertThat(follow.getPersonaFollowed().getUsername()).isEqualTo("followed_persona");
        }
    }

    @Nested
    @DisplayName("setters (@Data)")
    class Setters {

        @Test
        @DisplayName("should update id via setter")
        void shouldUpdateIdViaSetter() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            follow.setId(99L);

            assertThat(follow.getId()).isEqualTo(99L);
        }

        @Test
        @DisplayName("should update follower via setter")
        void shouldUpdateFollowerViaSetter() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            User newFollower = User.builder()
                    .clerkId("clerk_new_999")
                    .username("new_follower")
                    .bio("new bio")
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();

            follow.setFollower(newFollower);

            assertThat(follow.getFollower().getClerkId()).isEqualTo("clerk_new_999");
            assertThat(follow.getFollower().getUsername()).isEqualTo("new_follower");
        }

        @Test
        @DisplayName("should update userFollowed via setter")
        void shouldUpdateUserFollowedViaSetter() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            User newFollowed = User.builder()
                    .clerkId("clerk_new_followed_888")
                    .username("new_followed")
                    .bio("new followed bio")
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();

            follow.setUserFollowed(newFollowed);

            assertThat(follow.getUserFollowed().getClerkId()).isEqualTo("clerk_new_followed_888");
        }

        @Test
        @DisplayName("should update personaFollowed via setter")
        void shouldUpdatePersonaFollowedViaSetter() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .personaFollowed(followedPersona)
                    .build();

            Persona newPersona = Persona.builder()
                    .personaId(99L)
                    .username("new_persona")
                    .bio("new persona bio")
                    .createdAt(OffsetDateTime.now())
                    .build();

            follow.setPersonaFollowed(newPersona);

            assertThat(follow.getPersonaFollowed().getPersonaId()).isEqualTo(99L);
            assertThat(follow.getPersonaFollowed().getUsername()).isEqualTo("new_persona");
        }

        @Test
        @DisplayName("should update createdAt via setter")
        void shouldUpdateCreatedAtViaSetter() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();
            OffsetDateTime now = OffsetDateTime.now();

            follow.setCreatedAt(now);

            assertThat(follow.getCreatedAt()).isEqualTo(now);
        }

        @Test
        @DisplayName("should update updatedAt via setter")
        void shouldUpdateUpdatedAtViaSetter() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();
            OffsetDateTime now = OffsetDateTime.now();

            follow.setUpdatedAt(now);

            assertThat(follow.getUpdatedAt()).isEqualTo(now);
        }

        @Test
        @DisplayName("should allow setting follower to null")
        void shouldAllowSettingFollowerToNull() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            follow.setFollower(null);

            assertThat(follow.getFollower()).isNull();
        }

        @Test
        @DisplayName("should allow setting userFollowed to null")
        void shouldAllowSettingUserFollowedToNull() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            follow.setUserFollowed(null);

            assertThat(follow.getUserFollowed()).isNull();
        }

        @Test
        @DisplayName("should allow setting personaFollowed to null")
        void shouldAllowSettingPersonaFollowedToNull() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .personaFollowed(followedPersona)
                    .build();

            follow.setPersonaFollowed(null);

            assertThat(follow.getPersonaFollowed()).isNull();
        }
    }

    @Nested
    @DisplayName("prePersist (@PrePersist)")
    class PrePersist {

        @Test
        @DisplayName("should set createdAt and updatedAt when following a user")
        void shouldSetTimestampsWhenFollowingUser() throws Exception {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            assertThat(follow.getCreatedAt()).isNull();
            assertThat(follow.getUpdatedAt()).isNull();

            invokePrePersist(follow);

            assertThat(follow.getCreatedAt()).isNotNull();
            assertThat(follow.getUpdatedAt()).isNotNull();
        }

        @Test
        @DisplayName("should set createdAt and updatedAt when following a persona")
        void shouldSetTimestampsWhenFollowingPersona() throws Exception {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .personaFollowed(followedPersona)
                    .build();

            invokePrePersist(follow);

            assertThat(follow.getCreatedAt()).isNotNull();
            assertThat(follow.getUpdatedAt()).isNotNull();
        }

        @Test
        @DisplayName("should set both timestamps to approximately the same time")
        void shouldSetBothTimestampsToApproximatelySameTime() throws Exception {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            invokePrePersist(follow);

            assertThat(follow.getCreatedAt()).isEqualTo(follow.getUpdatedAt());
        }

        @Test
        @DisplayName("should throw IllegalStateException when both userFollowed and personaFollowed are set")
        void shouldThrowWhenBothFollowedAreSet() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .personaFollowed(followedPersona)
                    .build();

            assertThatThrownBy(() -> invokePrePersist(follow))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("A user must follow either a persona or another user, not both or neither.");
        }

        @Test
        @DisplayName("should throw IllegalStateException when neither userFollowed nor personaFollowed are set")
        void shouldThrowWhenNeitherFollowedIsSet() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .build();

            assertThatThrownBy(() -> invokePrePersist(follow))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("A user must follow either a persona or another user, not both or neither.");
        }
    }

    @Nested
    @DisplayName("preUpdate (@PreUpdate)")
    class PreUpdate {

        @Test
        @DisplayName("should update updatedAt to current time")
        void shouldUpdateUpdatedAtToCurrentTime() throws Exception {
            OffsetDateTime oldTime = OffsetDateTime.now().minusDays(7);
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .createdAt(oldTime)
                    .updatedAt(oldTime)
                    .build();

            OffsetDateTime beforeUpdate = OffsetDateTime.now();
            invokePreUpdate(follow);

            assertThat(follow.getUpdatedAt()).isAfterOrEqualTo(beforeUpdate);
        }

        @Test
        @DisplayName("should not modify createdAt when updating")
        void shouldNotModifyCreatedAtWhenUpdating() throws Exception {
            OffsetDateTime createdTime = OffsetDateTime.now().minusDays(30);
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .createdAt(createdTime)
                    .updatedAt(createdTime)
                    .build();

            invokePreUpdate(follow);

            assertThat(follow.getCreatedAt()).isEqualTo(createdTime);
        }

        @Test
        @DisplayName("should throw IllegalStateException when both followed are set during update")
        void shouldThrowWhenBothFollowedAreSetDuringUpdate() {
            OffsetDateTime now = OffsetDateTime.now();
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .personaFollowed(followedPersona)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            assertThatThrownBy(() -> invokePreUpdate(follow))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("A user must follow either a persona or another user, not both or neither.");
        }

        @Test
        @DisplayName("should throw IllegalStateException when neither followed is set during update")
        void shouldThrowWhenNeitherFollowedIsSetDuringUpdate() {
            OffsetDateTime now = OffsetDateTime.now();
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            assertThatThrownBy(() -> invokePreUpdate(follow))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("A user must follow either a persona or another user, not both or neither.");
        }

        @Test
        @DisplayName("should always overwrite updatedAt regardless of current value")
        void shouldAlwaysOverwriteUpdatedAt() throws Exception {
            OffsetDateTime futureTime = OffsetDateTime.now().plusDays(100);
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(futureTime)
                    .build();

            invokePreUpdate(follow);

            assertThat(follow.getUpdatedAt()).isBefore(futureTime);
        }
    }

    @Nested
    @DisplayName("validateRelations")
    class ValidateRelations {

        @Test
        @DisplayName("should pass validation when only userFollowed is set")
        void shouldPassWhenOnlyUserFollowedIsSet() throws Exception {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            // Should not throw
            invokePrePersist(follow);

            assertThat(follow.getCreatedAt()).isNotNull();
        }

        @Test
        @DisplayName("should pass validation when only personaFollowed is set")
        void shouldPassWhenOnlyPersonaFollowedIsSet() throws Exception {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .personaFollowed(followedPersona)
                    .build();

            // Should not throw
            invokePrePersist(follow);

            assertThat(follow.getCreatedAt()).isNotNull();
        }

        @Test
        @DisplayName("should fail validation when both are null")
        void shouldFailWhenBothAreNull() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(null)
                    .personaFollowed(null)
                    .build();

            assertThatThrownBy(() -> invokePrePersist(follow))
                    .isInstanceOf(IllegalStateException.class);
        }

        @Test
        @DisplayName("should fail validation when both are non-null")
        void shouldFailWhenBothAreNonNull() {
            UserFollow follow = UserFollow.builder()
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .personaFollowed(followedPersona)
                    .build();

            assertThatThrownBy(() -> invokePrePersist(follow))
                    .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested
    @DisplayName("equals and hashCode (@Data)")
    class EqualsAndHashCode {

        @Test
        @DisplayName("should be equal when all fields match")
        void shouldBeEqualWhenAllFieldsMatch() {
            OffsetDateTime now = OffsetDateTime.now();
            UserFollow f1 = UserFollow.builder()
                    .id(1L)
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
            UserFollow f2 = UserFollow.builder()
                    .id(1L)
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            assertThat(f1).isEqualTo(f2);
            assertThat(f1.hashCode()).isEqualTo(f2.hashCode());
        }

        @Test
        @DisplayName("should not be equal when id differs")
        void shouldNotBeEqualWhenIdDiffers() {
            UserFollow f1 = UserFollow.builder().id(1L).follower(followerUser).userFollowed(followedUser).build();
            UserFollow f2 = UserFollow.builder().id(2L).follower(followerUser).userFollowed(followedUser).build();

            assertThat(f1).isNotEqualTo(f2);
        }

        @Test
        @DisplayName("should not be equal when follower differs")
        void shouldNotBeEqualWhenFollowerDiffers() {
            User anotherUser = User.builder()
                    .clerkId("clerk_another_999")
                    .username("another")
                    .bio("Another bio")
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();

            UserFollow f1 = UserFollow.builder().id(1L).follower(followerUser).userFollowed(followedUser).build();
            UserFollow f2 = UserFollow.builder().id(1L).follower(anotherUser).userFollowed(followedUser).build();

            assertThat(f1).isNotEqualTo(f2);
        }

        @Test
        @DisplayName("should not be equal when userFollowed differs")
        void shouldNotBeEqualWhenUserFollowedDiffers() {
            User anotherUser = User.builder()
                    .clerkId("clerk_another_999")
                    .username("another")
                    .bio("Another bio")
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();

            UserFollow f1 = UserFollow.builder().id(1L).follower(followerUser).userFollowed(followedUser).build();
            UserFollow f2 = UserFollow.builder().id(1L).follower(followerUser).userFollowed(anotherUser).build();

            assertThat(f1).isNotEqualTo(f2);
        }

        @Test
        @DisplayName("should not be equal to null")
        void shouldNotBeEqualToNull() {
            UserFollow follow = UserFollow.builder().id(1L).follower(followerUser).userFollowed(followedUser).build();

            assertThat(follow).isNotEqualTo(null);
        }

        @Test
        @DisplayName("should be equal to itself")
        void shouldBeEqualToItself() {
            UserFollow follow = UserFollow.builder().id(1L).follower(followerUser).userFollowed(followedUser).build();

            assertThat(follow).isEqualTo(follow);
        }
    }

    @Nested
    @DisplayName("toString (@Data)")
    class ToStringTest {

        @Test
        @DisplayName("should include id in toString")
        void shouldIncludeIdInToString() {
            UserFollow follow = UserFollow.builder()
                    .id(42L)
                    .follower(followerUser)
                    .userFollowed(followedUser)
                    .build();

            assertThat(follow.toString()).contains("42");
        }

        @Test
        @DisplayName("should not throw on toString with null fields")
        void shouldNotThrowOnToStringWithNullFields() {
            UserFollow follow = UserFollow.builder().build();

            String result = follow.toString();

            assertThat(result).isNotNull();
        }
    }
}
