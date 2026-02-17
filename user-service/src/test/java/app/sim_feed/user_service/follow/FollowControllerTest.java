package app.sim_feed.user_service.follow;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import com.clerk.backend_api.helpers.security.models.AuthenticateRequestOptions;
import com.fasterxml.jackson.databind.ObjectMapper;

import app.sim_feed.user_service.follow.models.FollowDto;
import app.sim_feed.user_service.follow.models.NewFollowDto;
import app.sim_feed.user_service.persona.models.PersonaDto;
import app.sim_feed.user_service.users.models.UserDto;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest(FollowController.class)
class FollowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private FollowService followService;

    @MockitoBean
    private AuthenticateRequestOptions authenticateRequestOptions;

    private static final String USER_ID = "clerk_user_123";
    private static final String OTHER_USER_ID = "clerk_user_456";

    private UsernamePasswordAuthenticationToken authToken(String userId) {
        return new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());
    }

    // --- POST /api/v1/follows ---

    @Test
    @DisplayName("POST /api/v1/follows - should return 201 when following a user")
    void shouldReturn201WhenFollowingUser() throws Exception {
        NewFollowDto newFollowDto = new NewFollowDto(OTHER_USER_ID, null);
        FollowDto responseDto = new FollowDto(
                1L,
                new UserDto(USER_ID, "requester", "requester bio"),
                new UserDto(OTHER_USER_ID, "followed", "followed bio"),
                null
        );

        when(followService.follow(any(NewFollowDto.class), eq(USER_ID))).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/follows")
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newFollowDto)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.follower.id").value(USER_ID))
                .andExpect(jsonPath("$.userFollowed.id").value(OTHER_USER_ID))
                .andExpect(jsonPath("$.personaFollowed").isEmpty());
    }

    @Test
    @DisplayName("POST /api/v1/follows - should return 201 when following a persona")
    void shouldReturn201WhenFollowingPersona() throws Exception {
        NewFollowDto newFollowDto = new NewFollowDto(null, 10L);
        FollowDto responseDto = new FollowDto(
                2L,
                new UserDto(USER_ID, "requester", "requester bio"),
                null,
                new PersonaDto(10L, "persona_user")
        );

        when(followService.follow(any(NewFollowDto.class), eq(USER_ID))).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/follows")
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newFollowDto)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.follower.id").value(USER_ID))
                .andExpect(jsonPath("$.userFollowed").isEmpty())
                .andExpect(jsonPath("$.personaFollowed.personaId").value(10));
    }

    @Test
    @DisplayName("POST /api/v1/follows - should return 400 when requester tries to follow themselves")
    void shouldReturn400WhenFollowingSelf() throws Exception {
        NewFollowDto newFollowDto = new NewFollowDto(USER_ID, null);

        when(followService.follow(any(NewFollowDto.class), eq(USER_ID)))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requester cannot follow themselves."));

        mockMvc.perform(post("/api/v1/follows")
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newFollowDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/follows - should return 400 when both userId and personaId are provided")
    void shouldReturn400WhenBothIdsProvided() throws Exception {
        NewFollowDto newFollowDto = new NewFollowDto(OTHER_USER_ID, 10L);

        when(followService.follow(any(NewFollowDto.class), eq(USER_ID)))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Either userId or personaId must be provided, not both."));

        mockMvc.perform(post("/api/v1/follows")
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newFollowDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/follows - should return 400 when neither userId nor personaId are provided")
    void shouldReturn400WhenNeitherIdProvided() throws Exception {
        NewFollowDto newFollowDto = new NewFollowDto(null, null);

        when(followService.follow(any(NewFollowDto.class), eq(USER_ID)))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Either userId or personaId must be provided, not both."));

        mockMvc.perform(post("/api/v1/follows")
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newFollowDto)))
                .andExpect(status().isBadRequest());
    }

    // --- DELETE /api/v1/follows/{id} ---

    @Test
    @DisplayName("DELETE /api/v1/follows/{id} - should return 204 when deleting own follow")
    void shouldReturn204WhenDeletingOwnFollow() throws Exception {
        doNothing().when(followService).deleteFollow(eq(1L), eq(USER_ID));

        mockMvc.perform(delete("/api/v1/follows/{id}", 1L)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/v1/follows/{id} - should return 403 when deleting someone else's follow")
    void shouldReturn403WhenDeletingOthersFollow() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "Requester is not the follower"))
                .when(followService).deleteFollow(eq(1L), eq(USER_ID));

        mockMvc.perform(delete("/api/v1/follows/{id}", 1L)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /api/v1/follows/{id} - should return 404 when follow not found")
    void shouldReturn404WhenFollowNotFound() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Follow not found"))
                .when(followService).deleteFollow(eq(999L), eq(USER_ID));

        mockMvc.perform(delete("/api/v1/follows/{id}", 999L)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }

    // --- GET /api/v1/follows/users/{userId}/follows ---

    @Test
    @DisplayName("GET /api/v1/follows/users/{userId}/follows - should return 200 with list of follows")
    void shouldReturn200WithFollows() throws Exception {
        List<FollowDto> follows = List.of(
                new FollowDto(1L, new UserDto(USER_ID, "requester", "bio"),
                        new UserDto(OTHER_USER_ID, "followed", "bio"), null),
                new FollowDto(2L, new UserDto(USER_ID, "requester", "bio"),
                        null, new PersonaDto(10L, "persona"))
        );

        when(followService.getAllUserFollows(USER_ID)).thenReturn(follows);

        mockMvc.perform(get("/api/v1/follows/users/{userId}/follows", USER_ID)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].follower.id").value(USER_ID))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].personaFollowed.personaId").value(10));
    }

    @Test
    @DisplayName("GET /api/v1/follows/users/{userId}/follows - should return 200 with empty list when no follows")
    void shouldReturn200WithEmptyFollows() throws Exception {
        when(followService.getAllUserFollows(USER_ID)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/follows/users/{userId}/follows", USER_ID)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // --- GET /api/v1/follows/users/{userId}/followers ---

    @Test
    @DisplayName("GET /api/v1/follows/users/{userId}/followers - should return 200 with list of followers")
    void shouldReturn200WithFollowers() throws Exception {
        List<FollowDto> followers = List.of(
                new FollowDto(3L, new UserDto(OTHER_USER_ID, "follower_user", "bio"),
                        new UserDto(USER_ID, "me", "my bio"), null)
        );

        when(followService.getAllUserFollowers(USER_ID)).thenReturn(followers);

        mockMvc.perform(get("/api/v1/follows/users/{userId}/followers", USER_ID)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(3))
                .andExpect(jsonPath("$[0].follower.id").value(OTHER_USER_ID))
                .andExpect(jsonPath("$[0].userFollowed.id").value(USER_ID));
    }

    @Test
    @DisplayName("GET /api/v1/follows/users/{userId}/followers - should return 200 with empty list when no followers")
    void shouldReturn200WithEmptyFollowers() throws Exception {
        when(followService.getAllUserFollowers(USER_ID)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/follows/users/{userId}/followers", USER_ID)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
