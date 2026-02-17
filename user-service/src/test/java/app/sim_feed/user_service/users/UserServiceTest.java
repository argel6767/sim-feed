package app.sim_feed.user_service.users;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.NoSuchElementException;
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

import app.sim_feed.user_service.users.models.User;
import app.sim_feed.user_service.users.models.UserDto;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private final String USER_ID = "clerk_user_123";
    private final String USERNAME = "testuser";
    private final String BIO = "This is a test bio";

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .clerkId(USER_ID)
                .username(USERNAME)
                .bio(BIO)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("getUserById")
    class GetUserById {

        @Test
        @DisplayName("should return user when found")
        void shouldReturnUserWhenFound() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));

            User result = userService.getUserById(USER_ID);

            assertThat(result).isNotNull();
            assertThat(result.getClerkId()).isEqualTo(USER_ID);
            assertThat(result.getUsername()).isEqualTo(USERNAME);
            assertThat(result.getBio()).isEqualTo(BIO);
            verify(userRepository).findById(USER_ID);
        }

        @Test
        @DisplayName("should throw NoSuchElementException when user not found")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById("nonexistent")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getUserById("nonexistent"))
                    .isInstanceOf(NoSuchElementException.class);
            verify(userRepository).findById("nonexistent");
        }
    }

    @Nested
    @DisplayName("updateUser")
    class UpdateUser {

        @Test
        @DisplayName("should update user successfully when all validations pass")
        void shouldUpdateUserSuccessfully() {
            UserDto updateDto = new UserDto(USER_ID, "newusername", "new bio");
            User savedUser = User.builder()
                    .clerkId(USER_ID)
                    .username("newusername")
                    .bio("new bio")
                    .createdAt(testUser.getCreatedAt())
                    .updatedAt(OffsetDateTime.now())
                    .build();

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(savedUser);

            UserDto result = userService.updateUser(USER_ID, USER_ID, updateDto);

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(USER_ID);
            assertThat(result.username()).isEqualTo("newusername");
            assertThat(result.bio()).isEqualTo("new bio");
            verify(userRepository).findById(USER_ID);
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("should throw UNAUTHORIZED when userId does not match requesterId")
        void shouldThrowUnauthorizedWhenUserIdMismatch() {
            String differentUserId = "different_user_456";
            UserDto updateDto = new UserDto(USER_ID, "newusername", "new bio");

            assertThatThrownBy(() -> userService.updateUser(USER_ID, differentUserId, updateDto))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Cannot update a user's information that is not owned by the requester");

            verify(userRepository, never()).findById(any());
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw BAD_REQUEST when body ID does not match URL ID")
        void shouldThrowBadRequestWhenBodyIdMismatch() {
            UserDto updateDto = new UserDto("mismatched_id", "newusername", "new bio");

            assertThatThrownBy(() -> userService.updateUser(USER_ID, USER_ID, updateDto))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User ID in the request body does not match the ID in the URL");

            verify(userRepository, never()).findById(any());
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw BAD_REQUEST when bio exceeds 200 characters")
        void shouldThrowBadRequestWhenBioTooLong() {
            String longBio = "a".repeat(201);
            UserDto updateDto = new UserDto(USER_ID, "newusername", longBio);

            assertThatThrownBy(() -> userService.updateUser(USER_ID, USER_ID, updateDto))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Bio length exceeds maximum allowed length");

            verify(userRepository, never()).findById(any());
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should accept bio with exactly 200 characters")
        void shouldAcceptBioWithExactly200Characters() {
            String exactBio = "a".repeat(200);
            UserDto updateDto = new UserDto(USER_ID, "newusername", exactBio);

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            UserDto result = userService.updateUser(USER_ID, USER_ID, updateDto);

            assertThat(result).isNotNull();
            verify(userRepository).findById(USER_ID);
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("should throw BAD_REQUEST when username exceeds 50 characters")
        void shouldThrowBadRequestWhenUsernameTooLong() {
            String longUsername = "a".repeat(51);
            UserDto updateDto = new UserDto(USER_ID, longUsername, "valid bio");

            assertThatThrownBy(() -> userService.updateUser(USER_ID, USER_ID, updateDto))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Username length must be between 3 and 50 characters");

            verify(userRepository, never()).findById(any());
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should accept username with exactly 50 characters")
        void shouldAcceptUsernameWithExactly50Characters() {
            String exactUsername = "a".repeat(50);
            UserDto updateDto = new UserDto(USER_ID, exactUsername, "valid bio");

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            UserDto result = userService.updateUser(USER_ID, USER_ID, updateDto);

            assertThat(result).isNotNull();
            verify(userRepository).findById(USER_ID);
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("should throw NoSuchElementException when user to update is not found")
        void shouldThrowWhenUserToUpdateNotFound() {
            UserDto updateDto = new UserDto(USER_ID, "newusername", "new bio");
            when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.updateUser(USER_ID, USER_ID, updateDto))
                    .isInstanceOf(NoSuchElementException.class);

            verify(userRepository).findById(USER_ID);
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should set username and bio on user entity before saving")
        void shouldSetFieldsOnUserBeforeSaving() {
            UserDto updateDto = new UserDto(USER_ID, "updatedname", "updated bio");

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

            userService.updateUser(USER_ID, USER_ID, updateDto);

            assertThat(testUser.getUsername()).isEqualTo("updatedname");
            assertThat(testUser.getBio()).isEqualTo("updated bio");
            verify(userRepository).save(testUser);
        }
    }
}
