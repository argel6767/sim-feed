package app.sim_feed.user_service.follow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import app.sim_feed.user_service.follow.models.FollowDto;
import app.sim_feed.user_service.follow.models.NewFollowDto;
import app.sim_feed.user_service.follow.models.UserFollow;
import app.sim_feed.user_service.persona.PersonaService;
import app.sim_feed.user_service.persona.models.Persona;
import app.sim_feed.user_service.users.UserService;
import app.sim_feed.user_service.users.models.User;

@ExtendWith(MockitoExtension.class)
class FollowServiceTest {

    @Mock
    private FollowRepository followRepository;

    @Mock
    private UserService userService;

    @Mock
    private PersonaService personaService;

    @InjectMocks
    private FollowService followService;

    private User requester;
    private User targetUser;
    private Persona targetPersona;

    private static final String REQUESTER_ID = "clerk_requester_123";
    private static final String TARGET_USER_ID = "clerk_target_456";
    private static final Long TARGET_PERSONA_ID = 10L;

    @BeforeEach
    void setUp() {
        requester = User.builder()
                .clerkId(REQUESTER_ID)
                .username("requester")
                .bio("requester bio")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        targetUser = User.builder()
                .clerkId(TARGET_USER_ID)
                .username("target_user")
                .bio("target bio")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        targetPersona = Persona.builder()
                .personaId(TARGET_PERSONA_ID)
                .username("target_persona")
                .bio("persona bio")
                .createdAt(OffsetDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("follow")
    class Follow {

        @Test
        @DisplayName("should follow a user successfully")
        void shouldFollowUserSuccessfully() {
            NewFollowDto newFollowDto = new NewFollowDto(TARGET_USER_ID, null);
            UserFollow savedFollow = UserFollow.builder()
                    .id(1L)
                    .follower(requester)
                    .userFollowed(targetUser)
                    .build();

            when(userService.getUserById(TARGET_USER_ID)).thenReturn(targetUser);
            when(userService.getUserById(REQUESTER_ID)).thenReturn(requester);
            when(followRepository.save(any(UserFollow.class))).thenReturn(savedFollow);

            FollowDto result = followService.follow(newFollowDto, REQUESTER_ID);

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(1L);
            assertThat(result.follower().id()).isEqualTo(REQUESTER_ID);
            assertThat(result.userFollowed().id()).isEqualTo(TARGET_USER_ID);
            assertThat(result.personaFollowed()).isNull();
            verify(followRepository).save(any(UserFollow.class));
        }

        @Test
        @DisplayName("should follow a persona successfully")
        void shouldFollowPersonaSuccessfully() {
            NewFollowDto newFollowDto = new NewFollowDto(null, TARGET_PERSONA_ID);
            UserFollow savedFollow = UserFollow.builder()
                    .id(2L)
                    .follower(requester)
                    .personaFollowed(targetPersona)
                    .build();

            when(personaService.getPersonaById(TARGET_PERSONA_ID)).thenReturn(targetPersona);
            when(userService.getUserById(REQUESTER_ID)).thenReturn(requester);
            when(followRepository.save(any(UserFollow.class))).thenReturn(savedFollow);

            FollowDto result = followService.follow(newFollowDto, REQUESTER_ID);

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(2L);
            assertThat(result.follower().id()).isEqualTo(REQUESTER_ID);
            assertThat(result.userFollowed()).isNull();
            assertThat(result.personaFollowed().personaId()).isEqualTo(TARGET_PERSONA_ID);
            verify(followRepository).save(any(UserFollow.class));
        }

        @Test
        @DisplayName("should throw BAD_REQUEST when requester tries to follow themselves")
        void shouldThrowBadRequestWhenFollowingSelf() {
            NewFollowDto newFollowDto = new NewFollowDto(REQUESTER_ID, null);

            assertThatThrownBy(() -> followService.follow(newFollowDto, REQUESTER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Requester cannot follow themselves.");

            verify(followRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw BAD_REQUEST when both userId and personaId are provided")
        void shouldThrowBadRequestWhenBothIdsProvided() {
            NewFollowDto newFollowDto = new NewFollowDto(TARGET_USER_ID, TARGET_PERSONA_ID);

            assertThatThrownBy(() -> followService.follow(newFollowDto, REQUESTER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Either userId or personaId must be provided, not both.");

            verify(followRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw BAD_REQUEST when neither userId nor personaId are provided")
        void shouldThrowBadRequestWhenNeitherIdProvided() {
            NewFollowDto newFollowDto = new NewFollowDto(null, null);

            assertThatThrownBy(() -> followService.follow(newFollowDto, REQUESTER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Either userId or personaId must be provided, not both.");

            verify(followRepository, never()).save(any());
        }

        @Test
        @DisplayName("should call userService.getUserById for both requester and target when following a user")
        void shouldCallUserServiceForBothUsersWhenFollowingUser() {
            NewFollowDto newFollowDto = new NewFollowDto(TARGET_USER_ID, null);
            UserFollow savedFollow = UserFollow.builder()
                    .id(1L)
                    .follower(requester)
                    .userFollowed(targetUser)
                    .build();

            when(userService.getUserById(TARGET_USER_ID)).thenReturn(targetUser);
            when(userService.getUserById(REQUESTER_ID)).thenReturn(requester);
            when(followRepository.save(any(UserFollow.class))).thenReturn(savedFollow);

            followService.follow(newFollowDto, REQUESTER_ID);

            verify(userService).getUserById(TARGET_USER_ID);
            verify(userService).getUserById(REQUESTER_ID);
        }

        @Test
        @DisplayName("should call personaService.getPersonaById when following a persona")
        void shouldCallPersonaServiceWhenFollowingPersona() {
            NewFollowDto newFollowDto = new NewFollowDto(null, TARGET_PERSONA_ID);
            UserFollow savedFollow = UserFollow.builder()
                    .id(2L)
                    .follower(requester)
                    .personaFollowed(targetPersona)
                    .build();

            when(personaService.getPersonaById(TARGET_PERSONA_ID)).thenReturn(targetPersona);
            when(userService.getUserById(REQUESTER_ID)).thenReturn(requester);
            when(followRepository.save(any(UserFollow.class))).thenReturn(savedFollow);

            followService.follow(newFollowDto, REQUESTER_ID);

            verify(personaService).getPersonaById(TARGET_PERSONA_ID);
            verify(userService).getUserById(REQUESTER_ID);
        }
    }

    @Nested
    @DisplayName("deleteFollow")
    class DeleteFollow {

        @Test
        @DisplayName("should delete follow successfully when requester is the follower")
        void shouldDeleteFollowSuccessfully() {
            UserFollow follow = UserFollow.builder()
                    .id(1L)
                    .follower(requester)
                    .userFollowed(targetUser)
                    .build();

            when(followRepository.findById(1L)).thenReturn(Optional.of(follow));

            followService.deleteFollow(1L, REQUESTER_ID);

            verify(followRepository).findById(1L);
            verify(followRepository).delete(follow);
        }

        @Test
        @DisplayName("should throw NOT_FOUND when follow does not exist")
        void shouldThrowNotFoundWhenFollowDoesNotExist() {
            when(followRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> followService.deleteFollow(999L, REQUESTER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Follow not found");

            verify(followRepository).findById(999L);
            verify(followRepository, never()).delete(any());
        }

        @Test
        @DisplayName("should throw FORBIDDEN when requester is not the follower")
        void shouldThrowForbiddenWhenRequesterIsNotFollower() {
            User otherUser = User.builder()
                    .clerkId("clerk_other_789")
                    .username("other_user")
                    .bio("other bio")
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();

            UserFollow follow = UserFollow.builder()
                    .id(1L)
                    .follower(otherUser)
                    .userFollowed(targetUser)
                    .build();

            when(followRepository.findById(1L)).thenReturn(Optional.of(follow));

            assertThatThrownBy(() -> followService.deleteFollow(1L, REQUESTER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Requester is not the follower");

            verify(followRepository).findById(1L);
            verify(followRepository, never()).delete(any());
        }
    }

    @Nested
    @DisplayName("getAllUserFollows")
    class GetAllUserFollows {

        @Test
        @DisplayName("should return list of follows for a user")
        void shouldReturnFollowsForUser() {
            UserFollow userFollowUser = UserFollow.builder()
                    .id(1L)
                    .follower(requester)
                    .userFollowed(targetUser)
                    .build();
            UserFollow userFollowPersona = UserFollow.builder()
                    .id(2L)
                    .follower(requester)
                    .personaFollowed(targetPersona)
                    .build();

            when(followRepository.findAllByFollower_ClerkId(REQUESTER_ID))
                    .thenReturn(List.of(userFollowUser, userFollowPersona));

            List<FollowDto> result = followService.getAllUserFollows(REQUESTER_ID);

            assertThat(result).hasSize(2);
            assertThat(result.get(0).id()).isEqualTo(1L);
            assertThat(result.get(0).userFollowed()).isNotNull();
            assertThat(result.get(0).personaFollowed()).isNull();
            assertThat(result.get(1).id()).isEqualTo(2L);
            assertThat(result.get(1).userFollowed()).isNull();
            assertThat(result.get(1).personaFollowed()).isNotNull();
            verify(followRepository).findAllByFollower_ClerkId(REQUESTER_ID);
        }

        @Test
        @DisplayName("should return empty list when user has no follows")
        void shouldReturnEmptyListWhenNoFollows() {
            when(followRepository.findAllByFollower_ClerkId(REQUESTER_ID))
                    .thenReturn(Collections.emptyList());

            List<FollowDto> result = followService.getAllUserFollows(REQUESTER_ID);

            assertThat(result).isEmpty();
            verify(followRepository).findAllByFollower_ClerkId(REQUESTER_ID);
        }
    }

    @Nested
    @DisplayName("getAllUserFollowers")
    class GetAllUserFollowers {

        @Test
        @DisplayName("should return list of followers for a user")
        void shouldReturnFollowersForUser() {
            User followerUser = User.builder()
                    .clerkId("clerk_follower_789")
                    .username("follower_user")
                    .bio("follower bio")
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();

            UserFollow follow = UserFollow.builder()
                    .id(3L)
                    .follower(followerUser)
                    .userFollowed(requester)
                    .build();

            when(followRepository.findAllByUserFollowed_ClerkId(REQUESTER_ID))
                    .thenReturn(List.of(follow));

            List<FollowDto> result = followService.getAllUserFollowers(REQUESTER_ID);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).id()).isEqualTo(3L);
            assertThat(result.get(0).follower().id()).isEqualTo("clerk_follower_789");
            assertThat(result.get(0).userFollowed().id()).isEqualTo(REQUESTER_ID);
            verify(followRepository).findAllByUserFollowed_ClerkId(REQUESTER_ID);
        }

        @Test
        @DisplayName("should return empty list when user has no followers")
        void shouldReturnEmptyListWhenNoFollowers() {
            when(followRepository.findAllByUserFollowed_ClerkId(REQUESTER_ID))
                    .thenReturn(Collections.emptyList());

            List<FollowDto> result = followService.getAllUserFollowers(REQUESTER_ID);

            assertThat(result).isEmpty();
            verify(followRepository).findAllByUserFollowed_ClerkId(REQUESTER_ID);
        }
    }
}
