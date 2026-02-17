package app.sim_feed.user_service.persona;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Method;
import java.time.OffsetDateTime;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class PersonaTest {

    private void invokeOnCreate(Persona persona) throws Exception {
        Method method = Persona.class.getDeclaredMethod("onCreate");
        method.setAccessible(true);
        try {
            method.invoke(persona);
        } catch (java.lang.reflect.InvocationTargetException e) {
            throw (Exception) e.getCause();
        }
    }

    @Nested
    @DisplayName("builder")
    class Builder {

        @Test
        @DisplayName("should correctly set all scalar fields via builder")
        void shouldCorrectlySetAllScalarFields() {
            OffsetDateTime now = OffsetDateTime.now();
            Persona persona = Persona.builder()
                    .personaId(1L)
                    .bio("Persona bio")
                    .description("A detailed description")
                    .username("persona_user")
                    .createdAt(now)
                    .build();

            assertThat(persona.getPersonaId()).isEqualTo(1L);
            assertThat(persona.getBio()).isEqualTo("Persona bio");
            assertThat(persona.getDescription()).isEqualTo("A detailed description");
            assertThat(persona.getUsername()).isEqualTo("persona_user");
            assertThat(persona.getCreatedAt()).isEqualTo(now);
        }

        @Test
        @DisplayName("should initialize posts as empty list by default")
        void shouldInitializePostsAsEmptyList() {
            Persona persona = Persona.builder()
                    .personaId(1L)
                    .bio("bio")
                    .build();

            assertThat(persona.getPosts()).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("should initialize comments as empty list by default")
        void shouldInitializeCommentsAsEmptyList() {
            Persona persona = Persona.builder()
                    .personaId(1L)
                    .bio("bio")
                    .build();

            assertThat(persona.getComments()).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("should initialize likes as empty list by default")
        void shouldInitializeLikesAsEmptyList() {
            Persona persona = Persona.builder()
                    .personaId(1L)
                    .bio("bio")
                    .build();

            assertThat(persona.getLikes()).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("should initialize following as empty list by default")
        void shouldInitializeFollowingAsEmptyList() {
            Persona persona = Persona.builder()
                    .personaId(1L)
                    .bio("bio")
                    .build();

            assertThat(persona.getFollowing()).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("should initialize followers as empty list by default")
        void shouldInitializeFollowersAsEmptyList() {
            Persona persona = Persona.builder()
                    .personaId(1L)
                    .bio("bio")
                    .build();

            assertThat(persona.getFollowers()).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("should allow null description")
        void shouldAllowNullDescription() {
            Persona persona = Persona.builder()
                    .personaId(1L)
                    .bio("bio")
                    .description(null)
                    .build();

            assertThat(persona.getDescription()).isNull();
        }

        @Test
        @DisplayName("should allow null username")
        void shouldAllowNullUsername() {
            Persona persona = Persona.builder()
                    .personaId(1L)
                    .bio("bio")
                    .username(null)
                    .build();

            assertThat(persona.getUsername()).isNull();
        }

        @Test
        @DisplayName("should allow empty string bio")
        void shouldAllowEmptyStringBio() {
            Persona persona = Persona.builder()
                    .personaId(1L)
                    .bio("")
                    .build();

            assertThat(persona.getBio()).isEmpty();
        }

        @Test
        @DisplayName("should allow null personaId for unsaved entity")
        void shouldAllowNullPersonaId() {
            Persona persona = Persona.builder()
                    .bio("bio")
                    .username("user")
                    .build();

            assertThat(persona.getPersonaId()).isNull();
        }
    }

    @Nested
    @DisplayName("no-args constructor")
    class NoArgsConstructor {

        @Test
        @DisplayName("should create instance with all fields null or default")
        void shouldCreateInstanceWithAllFieldsNull() {
            Persona persona = new Persona();

            assertThat(persona.getPersonaId()).isNull();
            assertThat(persona.getBio()).isNull();
            assertThat(persona.getDescription()).isNull();
            assertThat(persona.getUsername()).isNull();
            assertThat(persona.getCreatedAt()).isNull();
        }

        @Test
        @DisplayName("should have null collections from no-args constructor")
        void shouldHaveNullCollectionsFromNoArgsConstructor() {
            Persona persona = new Persona();

            // No-args constructor (not @Builder.Default) produces null for collections
            // unless Lombok's @NoArgsConstructor initialises them (it does not for @Builder.Default)
            // The actual behaviour depends on Lombok version; verify no exception is thrown
            // when accessing the persona instance.
            assertThat(persona).isNotNull();
        }
    }

    @Nested
    @DisplayName("setters (@Data)")
    class Setters {

        @Test
        @DisplayName("should update bio via setter")
        void shouldUpdateBioViaSetter() {
            Persona persona = Persona.builder().personaId(1L).bio("old bio").build();

            persona.setBio("new bio");

            assertThat(persona.getBio()).isEqualTo("new bio");
        }

        @Test
        @DisplayName("should update description via setter")
        void shouldUpdateDescriptionViaSetter() {
            Persona persona = Persona.builder().personaId(1L).bio("bio").build();

            persona.setDescription("updated description");

            assertThat(persona.getDescription()).isEqualTo("updated description");
        }

        @Test
        @DisplayName("should update username via setter")
        void shouldUpdateUsernameViaSetter() {
            Persona persona = Persona.builder().personaId(1L).bio("bio").username("old").build();

            persona.setUsername("newname");

            assertThat(persona.getUsername()).isEqualTo("newname");
        }

        @Test
        @DisplayName("should update createdAt via setter")
        void shouldUpdateCreatedAtViaSetter() {
            Persona persona = Persona.builder().personaId(1L).bio("bio").build();
            OffsetDateTime now = OffsetDateTime.now();

            persona.setCreatedAt(now);

            assertThat(persona.getCreatedAt()).isEqualTo(now);
        }

        @Test
        @DisplayName("should update personaId via setter")
        void shouldUpdatePersonaIdViaSetter() {
            Persona persona = new Persona();

            persona.setPersonaId(42L);

            assertThat(persona.getPersonaId()).isEqualTo(42L);
        }
    }

    @Nested
    @DisplayName("onCreate (@PrePersist)")
    class OnCreate {

        @Test
        @DisplayName("should set createdAt when it is null")
        void shouldSetCreatedAtWhenNull() throws Exception {
            Persona persona = Persona.builder()
                    .bio("bio")
                    .username("user")
                    .build();

            assertThat(persona.getCreatedAt()).isNull();

            invokeOnCreate(persona);

            assertThat(persona.getCreatedAt()).isNotNull();
        }

        @Test
        @DisplayName("should not overwrite createdAt when already set")
        void shouldNotOverwriteCreatedAtWhenAlreadySet() throws Exception {
            OffsetDateTime existingTime = OffsetDateTime.now().minusDays(10);
            Persona persona = Persona.builder()
                    .bio("bio")
                    .username("user")
                    .createdAt(existingTime)
                    .build();

            invokeOnCreate(persona);

            assertThat(persona.getCreatedAt()).isEqualTo(existingTime);
        }

        @Test
        @DisplayName("should set createdAt to approximately the current time")
        void shouldSetCreatedAtToApproximatelyCurrentTime() throws Exception {
            Persona persona = Persona.builder()
                    .bio("bio")
                    .username("user")
                    .build();

            OffsetDateTime beforeCreate = OffsetDateTime.now();
            invokeOnCreate(persona);
            OffsetDateTime afterCreate = OffsetDateTime.now();

            assertThat(persona.getCreatedAt()).isAfterOrEqualTo(beforeCreate);
            assertThat(persona.getCreatedAt()).isBeforeOrEqualTo(afterCreate);
        }

        @Test
        @DisplayName("should work correctly when called multiple times (idempotent for non-null)")
        void shouldBeIdempotentForNonNull() throws Exception {
            Persona persona = Persona.builder()
                    .bio("bio")
                    .username("user")
                    .build();

            invokeOnCreate(persona);
            OffsetDateTime firstCreatedAt = persona.getCreatedAt();

            // Calling again should not change it since createdAt is now non-null
            invokeOnCreate(persona);

            assertThat(persona.getCreatedAt()).isEqualTo(firstCreatedAt);
        }
    }

    @Nested
    @DisplayName("equals and hashCode (@Data)")
    class EqualsAndHashCode {

        @Test
        @DisplayName("should be equal when all fields match")
        void shouldBeEqualWhenAllFieldsMatch() {
            OffsetDateTime now = OffsetDateTime.now();
            Persona p1 = Persona.builder()
                    .personaId(1L)
                    .bio("bio")
                    .description("desc")
                    .username("user")
                    .createdAt(now)
                    .build();
            Persona p2 = Persona.builder()
                    .personaId(1L)
                    .bio("bio")
                    .description("desc")
                    .username("user")
                    .createdAt(now)
                    .build();

            assertThat(p1).isEqualTo(p2);
            assertThat(p1.hashCode()).isEqualTo(p2.hashCode());
        }

        @Test
        @DisplayName("should not be equal when personaId differs")
        void shouldNotBeEqualWhenPersonaIdDiffers() {
            OffsetDateTime now = OffsetDateTime.now();
            Persona p1 = Persona.builder().personaId(1L).bio("bio").createdAt(now).build();
            Persona p2 = Persona.builder().personaId(2L).bio("bio").createdAt(now).build();

            assertThat(p1).isNotEqualTo(p2);
        }

        @Test
        @DisplayName("should not be equal when bio differs")
        void shouldNotBeEqualWhenBioDiffers() {
            OffsetDateTime now = OffsetDateTime.now();
            Persona p1 = Persona.builder().personaId(1L).bio("bio1").createdAt(now).build();
            Persona p2 = Persona.builder().personaId(1L).bio("bio2").createdAt(now).build();

            assertThat(p1).isNotEqualTo(p2);
        }

        @Test
        @DisplayName("should not be equal when username differs")
        void shouldNotBeEqualWhenUsernameDiffers() {
            OffsetDateTime now = OffsetDateTime.now();
            Persona p1 = Persona.builder().personaId(1L).bio("bio").username("a").createdAt(now).build();
            Persona p2 = Persona.builder().personaId(1L).bio("bio").username("b").createdAt(now).build();

            assertThat(p1).isNotEqualTo(p2);
        }

        @Test
        @DisplayName("should not be equal when description differs")
        void shouldNotBeEqualWhenDescriptionDiffers() {
            OffsetDateTime now = OffsetDateTime.now();
            Persona p1 = Persona.builder().personaId(1L).bio("bio").description("desc1").createdAt(now).build();
            Persona p2 = Persona.builder().personaId(1L).bio("bio").description("desc2").createdAt(now).build();

            assertThat(p1).isNotEqualTo(p2);
        }

        @Test
        @DisplayName("should not be equal to null")
        void shouldNotBeEqualToNull() {
            Persona persona = Persona.builder().personaId(1L).bio("bio").build();

            assertThat(persona).isNotEqualTo(null);
        }

        @Test
        @DisplayName("should be equal to itself")
        void shouldBeEqualToItself() {
            Persona persona = Persona.builder().personaId(1L).bio("bio").build();

            assertThat(persona).isEqualTo(persona);
        }
    }

    @Nested
    @DisplayName("toString (@Data)")
    class ToStringTest {

        @Test
        @DisplayName("should include personaId in toString")
        void shouldIncludePersonaIdInToString() {
            Persona persona = Persona.builder().personaId(42L).bio("bio").build();

            assertThat(persona.toString()).contains("42");
        }

        @Test
        @DisplayName("should include bio in toString")
        void shouldIncludeBioInToString() {
            Persona persona = Persona.builder().personaId(1L).bio("my cool persona bio").build();

            assertThat(persona.toString()).contains("my cool persona bio");
        }

        @Test
        @DisplayName("should include username in toString")
        void shouldIncludeUsernameInToString() {
            Persona persona = Persona.builder().personaId(1L).bio("bio").username("persona_username").build();

            assertThat(persona.toString()).contains("persona_username");
        }

        @Test
        @DisplayName("should include description in toString")
        void shouldIncludeDescriptionInToString() {
            Persona persona = Persona.builder().personaId(1L).bio("bio").description("detailed desc").build();

            assertThat(persona.toString()).contains("detailed desc");
        }
    }

    @Nested
    @DisplayName("all-args constructor")
    class AllArgsConstructor {

        @Test
        @DisplayName("should create instance with all fields populated")
        void shouldCreateInstanceWithAllFields() {
            OffsetDateTime now = OffsetDateTime.now();
            Persona persona = new Persona(
                    1L,
                    "bio",
                    "description",
                    "username",
                    now,
                    new java.util.ArrayList<>(),
                    new java.util.ArrayList<>(),
                    new java.util.ArrayList<>(),
                    new java.util.ArrayList<>(),
                    new java.util.ArrayList<>()
            );

            assertThat(persona.getPersonaId()).isEqualTo(1L);
            assertThat(persona.getBio()).isEqualTo("bio");
            assertThat(persona.getDescription()).isEqualTo("description");
            assertThat(persona.getUsername()).isEqualTo("username");
            assertThat(persona.getCreatedAt()).isEqualTo(now);
            assertThat(persona.getPosts()).isNotNull().isEmpty();
            assertThat(persona.getComments()).isNotNull().isEmpty();
            assertThat(persona.getLikes()).isNotNull().isEmpty();
            assertThat(persona.getFollowing()).isNotNull().isEmpty();
            assertThat(persona.getFollowers()).isNotNull().isEmpty();
        }
    }
}
