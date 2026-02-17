package app.sim_feed.user_service.users;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import com.clerk.backend_api.helpers.security.models.AuthenticateRequestOptions;
import com.fasterxml.jackson.databind.ObjectMapper;

import app.sim_feed.user_service.users.models.UserDto;

import java.util.Collections;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    
    private ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private AuthenticateRequestOptions authenticateRequestOptions;

    private static final String USER_ID = "clerk_user_123";

    private UsernamePasswordAuthenticationToken authToken(String userId) {
        return new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());
    }

    @Test
    @DisplayName("PUT /api/v1/users/{id} - should return 200 with updated user")
    void shouldReturnUpdatedUser() throws Exception {
        UserDto requestDto = new UserDto(USER_ID, "newusername", "new bio");
        UserDto responseDto = new UserDto(USER_ID, "newusername", "new bio");

        when(userService.updateUser(eq(USER_ID), eq(USER_ID), any(UserDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(put("/api/v1/users/{id}", USER_ID)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(USER_ID))
                .andExpect(jsonPath("$.username").value("newusername"))
                .andExpect(jsonPath("$.bio").value("new bio"));
    }

    @Test
    @DisplayName("PUT /api/v1/users/{id} - should return 401 when user is not authorized")
    void shouldReturn401WhenUnauthorized() throws Exception {
        UserDto requestDto = new UserDto(USER_ID, "newusername", "new bio");
        String differentUser = "different_user_456";

        when(userService.updateUser(eq(USER_ID), eq(differentUser), any(UserDto.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Cannot update a user's information that is not owned by the requester"));

        mockMvc.perform(put("/api/v1/users/{id}", USER_ID)
                        .with(authentication(authToken(differentUser)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT /api/v1/users/{id} - should return 400 when body ID mismatches URL ID")
    void shouldReturn400WhenBodyIdMismatch() throws Exception {
        UserDto requestDto = new UserDto("wrong_id", "newusername", "new bio");

        when(userService.updateUser(eq(USER_ID), eq(USER_ID), any(UserDto.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "User ID in the request body does not match the ID in the URL"));

        mockMvc.perform(put("/api/v1/users/{id}", USER_ID)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/v1/users/{id} - should return 400 when bio exceeds max length")
    void shouldReturn400WhenBioTooLong() throws Exception {
        String longBio = "a".repeat(201);
        UserDto requestDto = new UserDto(USER_ID, "newusername", longBio);

        when(userService.updateUser(eq(USER_ID), eq(USER_ID), any(UserDto.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Bio length exceeds maximum allowed length"));

        mockMvc.perform(put("/api/v1/users/{id}", USER_ID)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/v1/users/{id} - should return 400 when username exceeds max length")
    void shouldReturn400WhenUsernameTooLong() throws Exception {
        String longUsername = "a".repeat(51);
        UserDto requestDto = new UserDto(USER_ID, longUsername, "valid bio");

        when(userService.updateUser(eq(USER_ID), eq(USER_ID), any(UserDto.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Username length must be between 3 and 50 characters"));

        mockMvc.perform(put("/api/v1/users/{id}", USER_ID)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isBadRequest());
    }
}
