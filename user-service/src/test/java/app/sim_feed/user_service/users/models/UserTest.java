package app.sim_feed.user_service.users.models;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Method;
import java.time.OffsetDateTime;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class UserTest {

    private void invokeOnCreate(User user) throws Exception {
        Method method = User.class.getDeclaredMethod("onCreate");
        method.setAccessible(true);
        try {
            method.invoke(user);
        } catch (java.lang.reflect.InvocationTargetException e) {
            throw (Exception) e.getCause();
        }
    }

    private void invokeOnUpdate(User user) throws Exception {
        Method method = User.class.getDeclaredMethod("onUpdate");
        method.setAccessible(true);
        try {
            method.invoke(user);
        } catch (java.lang.reflect.InvocationTargetException e) {
            throw (Exception) e.getCause();
        }
    }

    @Nested
    @DisplayName("builder")
    class Builder {

        @Test
        @DisplayName("should correctly set all fields via builder")
        void shouldCorrectlySetAllFields() {
            OffsetDateTime now = OffsetDateTime.now();
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .bio("Test bio")
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            assertThat(user.getClerkId()).isEqualTo("clerk_123");
            assertThat(user.getUsername()).isEqualTo("testuser");
            assertThat(user.getBio()).isEqualTo("Test bio");
            assertThat(user.getCreatedAt()).isEqualTo(now);
            assertThat(user.getUpdatedAt()).isEqualTo(now);
        }

        @Test
        @DisplayName("should initialize posts as empty list by default")
        void shouldInitializePostsAsEmptyList() {
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .build();

            assertThat(user.getPosts()).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("should initialize comments as empty list by default")
        void shouldInitializeCommentsAsEmptyList() {
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .build();

            assertThat(user.getComments()).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("should initialize likes as empty list by default")
        void shouldInitializeLikesAsEmptyList() {
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .build();

            assertThat(user.getLikes()).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("should allow null bio")
        void shouldAllowNullBio() {
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .bio(null)
                    .build();

            assertThat(user.getBio()).isNull();
        }

        @Test
        @DisplayName("should allow empty string bio")
        void shouldAllowEmptyStringBio() {
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .bio("")
                    .build();

            assertThat(user.getBio()).isEmpty();
        }
    }

    @Nested
    @DisplayName("no-args constructor")
    class NoArgsConstructor {

        @Test
        @DisplayName("should create instance with all fields null/default")
        void shouldCreateInstanceWithAllFieldsNull() {
            User user = new User();

            assertThat(user.getClerkId()).isNull();
            assertThat(user.getUsername()).isNull();
            assertThat(user.getBio()).isNull();
            assertThat(user.getCreatedAt()).isNull();
            assertThat(user.getUpdatedAt()).isNull();
        }
    }

    @Nested
    @DisplayName("all-args constructor")
    class AllArgsConstructor {

        @Test
        @DisplayName("should create instance with all fields populated")
        void shouldCreateInstanceWithAllFields() {
            OffsetDateTime now = OffsetDateTime.now();
            User user = new User("clerk_abc", "myuser", "my bio", now, now, null, null, null, null, null);

            assertThat(user.getClerkId()).isEqualTo("clerk_abc");
            assertThat(user.getUsername()).isEqualTo("myuser");
            assertThat(user.getBio()).isEqualTo("my bio");
            assertThat(user.getCreatedAt()).isEqualTo(now);
            assertThat(user.getUpdatedAt()).isEqualTo(now);
        }
    }

    @Nested
    @DisplayName("setters (@Data)")
    class Setters {

        @Test
        @DisplayName("should update username via setter")
        void shouldUpdateUsernameViaSetter() {
            User user = User.builder().clerkId("clerk_123").username("old").build();

            user.setUsername("newname");

            assertThat(user.getUsername()).isEqualTo("newname");
        }

        @Test
        @DisplayName("should update bio via setter")
        void shouldUpdateBioViaSetter() {
            User user = User.builder().clerkId("clerk_123").username("user").bio("old bio").build();

            user.setBio("new bio");

            assertThat(user.getBio()).isEqualTo("new bio");
        }

        @Test
        @DisplayName("should update clerkId via setter")
        void shouldUpdateClerkIdViaSetter() {
            User user = new User();

            user.setClerkId("clerk_new_id");

            assertThat(user.getClerkId()).isEqualTo("clerk_new_id");
        }
    }

    @Nested
    @DisplayName("onCreate (@PrePersist)")
    class OnCreate {

        @Test
        @DisplayName("should set createdAt when it is null")
        void shouldSetCreatedAtWhenNull() throws Exception {
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .build();

            assertThat(user.getCreatedAt()).isNull();

            invokeOnCreate(user);

            assertThat(user.getCreatedAt()).isNotNull();
        }

        @Test
        @DisplayName("should set updatedAt when it is null")
        void shouldSetUpdatedAtWhenNull() throws Exception {
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .build();

            assertThat(user.getUpdatedAt()).isNull();

            invokeOnCreate(user);

            assertThat(user.getUpdatedAt()).isNotNull();
        }

        @Test
        @DisplayName("should not overwrite createdAt when already set")
        void shouldNotOverwriteCreatedAtWhenAlreadySet() throws Exception {
            OffsetDateTime existingTime = OffsetDateTime.now().minusDays(10);
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .createdAt(existingTime)
                    .build();

            invokeOnCreate(user);

            assertThat(user.getCreatedAt()).isEqualTo(existingTime);
        }

        @Test
        @DisplayName("should not overwrite updatedAt when already set")
        void shouldNotOverwriteUpdatedAtWhenAlreadySet() throws Exception {
            OffsetDateTime existingTime = OffsetDateTime.now().minusDays(5);
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .updatedAt(existingTime)
                    .build();

            invokeOnCreate(user);

            assertThat(user.getUpdatedAt()).isEqualTo(existingTime);
        }

        @Test
        @DisplayName("should set both createdAt and updatedAt to approximately the same time")
        void shouldSetBothTimestampsToApproximatelySameTime() throws Exception {
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .build();

            invokeOnCreate(user);

            assertThat(user.getCreatedAt()).isNotNull();
            assertThat(user.getUpdatedAt()).isNotNull();
            // Both are derived from the same OffsetDateTime.now() call inside onCreate
            assertThat(user.getCreatedAt()).isEqualTo(user.getUpdatedAt());
        }

        @Test
        @DisplayName("should set createdAt even when updatedAt is already set")
        void shouldSetCreatedAtEvenWhenUpdatedAtAlreadySet() throws Exception {
            OffsetDateTime existingUpdatedAt = OffsetDateTime.now().minusDays(1);
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .updatedAt(existingUpdatedAt)
                    .build();

            invokeOnCreate(user);

            assertThat(user.getCreatedAt()).isNotNull();
            assertThat(user.getUpdatedAt()).isEqualTo(existingUpdatedAt);
        }

        @Test
        @DisplayName("should set updatedAt even when createdAt is already set")
        void shouldSetUpdatedAtEvenWhenCreatedAtAlreadySet() throws Exception {
            OffsetDateTime existingCreatedAt = OffsetDateTime.now().minusDays(1);
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .createdAt(existingCreatedAt)
                    .build();

            invokeOnCreate(user);

            assertThat(user.getCreatedAt()).isEqualTo(existingCreatedAt);
            assertThat(user.getUpdatedAt()).isNotNull();
        }
    }

    @Nested
    @DisplayName("onUpdate (@PreUpdate)")
    class OnUpdate {

        @Test
        @DisplayName("should update updatedAt to current time")
        void shouldUpdateUpdatedAtToCurrentTime() throws Exception {
            OffsetDateTime oldTime = OffsetDateTime.now().minusDays(7);
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .createdAt(oldTime)
                    .updatedAt(oldTime)
                    .build();

            OffsetDateTime beforeUpdate = OffsetDateTime.now();
            invokeOnUpdate(user);

            assertThat(user.getUpdatedAt()).isAfterOrEqualTo(beforeUpdate);
        }

        @Test
        @DisplayName("should not modify createdAt when updating")
        void shouldNotModifyCreatedAtWhenUpdating() throws Exception {
            OffsetDateTime createdTime = OffsetDateTime.now().minusDays(30);
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .createdAt(createdTime)
                    .updatedAt(createdTime)
                    .build();

            invokeOnUpdate(user);

            assertThat(user.getCreatedAt()).isEqualTo(createdTime);
        }

        @Test
        @DisplayName("should always overwrite updatedAt regardless of current value")
        void shouldAlwaysOverwriteUpdatedAt() throws Exception {
            OffsetDateTime futureTime = OffsetDateTime.now().plusDays(100);
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .updatedAt(futureTime)
                    .build();

            invokeOnUpdate(user);

            assertThat(user.getUpdatedAt()).isBefore(futureTime);
        }

        @Test
        @DisplayName("should set updatedAt even if it was null before")
        void shouldSetUpdatedAtEvenIfNull() throws Exception {
            User user = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .build();

            assertThat(user.getUpdatedAt()).isNull();

            invokeOnUpdate(user);

            assertThat(user.getUpdatedAt()).isNotNull();
        }
    }

    @Nested
    @DisplayName("equals and hashCode (@Data)")
    class EqualsAndHashCode {

        @Test
        @DisplayName("should be equal when all fields match")
        void shouldBeEqualWhenAllFieldsMatch() {
            OffsetDateTime now = OffsetDateTime.now();
            User user1 = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .bio("bio")
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
            User user2 = User.builder()
                    .clerkId("clerk_123")
                    .username("testuser")
                    .bio("bio")
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            assertThat(user1).isEqualTo(user2);
            assertThat(user1.hashCode()).isEqualTo(user2.hashCode());
        }

        @Test
        @DisplayName("should not be equal when clerkId differs")
        void shouldNotBeEqualWhenClerkIdDiffers() {
            OffsetDateTime now = OffsetDateTime.now();
            User user1 = User.builder().clerkId("clerk_1").username("u").createdAt(now).updatedAt(now).build();
            User user2 = User.builder().clerkId("clerk_2").username("u").createdAt(now).updatedAt(now).build();

            assertThat(user1).isNotEqualTo(user2);
        }

        @Test
        @DisplayName("should not be equal when username differs")
        void shouldNotBeEqualWhenUsernameDiffers() {
            OffsetDateTime now = OffsetDateTime.now();
            User user1 = User.builder().clerkId("clerk_1").username("user1").createdAt(now).updatedAt(now).build();
            User user2 = User.builder().clerkId("clerk_1").username("user2").createdAt(now).updatedAt(now).build();

            assertThat(user1).isNotEqualTo(user2);
        }

        @Test
        @DisplayName("should not be equal to null")
        void shouldNotBeEqualToNull() {
            User user = User.builder().clerkId("clerk_1").username("user").build();

            assertThat(user).isNotEqualTo(null);
        }

        @Test
        @DisplayName("should be equal to itself")
        void shouldBeEqualToItself() {
            User user = User.builder().clerkId("clerk_1").username("user").build();

            assertThat(user).isEqualTo(user);
        }
    }

    @Nested
    @DisplayName("toString (@Data)")
    class ToStringTest {

        @Test
        @DisplayName("should include clerkId in toString")
        void shouldIncludeClerkIdInToString() {
            User user = User.builder().clerkId("clerk_abc_123").username("user").build();

            assertThat(user.toString()).contains("clerk_abc_123");
        }

        @Test
        @DisplayName("should include username in toString")
        void shouldIncludeUsernameInToString() {
            User user = User.builder().clerkId("clerk_123").username("myusername").build();

            assertThat(user.toString()).contains("myusername");
        }

        @Test
        @DisplayName("should include bio in toString")
        void shouldIncludeBioInToString() {
            User user = User.builder().clerkId("clerk_123").username("user").bio("my cool bio").build();

            assertThat(user.toString()).contains("my cool bio");
        }
    }
}
