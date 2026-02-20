package app.sim_feed.user_service.post;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import app.sim_feed.user_service.post.models.NewPostDto;
import app.sim_feed.user_service.post.models.PostDto;
import app.sim_feed.user_service.users.models.UserDto;
import com.clerk.backend_api.helpers.security.models.AuthenticateRequestOptions;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Collections;
import java.util.NoSuchElementException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
@WebMvcTest(PostController.class)
class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private PostService postService;

    @MockitoBean
    private AuthenticateRequestOptions authenticateRequestOptions;

    private static final String USER_ID = "clerk_user_123";

    private UsernamePasswordAuthenticationToken authToken(String userId) {
        return new UsernamePasswordAuthenticationToken(
            userId,
            null,
            Collections.emptyList()
        );
    }

    @Test
    @DisplayName(
        "POST /api/v1/posts - should return 201 with created post and location header"
    )
    void shouldReturnCreatedPost() throws Exception {
        NewPostDto newPost = new NewPostDto("Test Title", "Test body content");
        UserDto userDto = new UserDto(USER_ID, "testuser", "Test bio");
        PostDto responseDto = new PostDto(
            userDto,
            1L,
            "Test Title",
            "Test body content"
        );

        when(
            postService.createPost(any(NewPostDto.class), eq(USER_ID))
        ).thenReturn(responseDto);

        mockMvc
            .perform(
                post("/api/v1/posts")
                    .with(authentication(authToken(USER_ID)))
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(newPost))
            )
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", "/api/v1/locations/1"))
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.title").value("Test Title"))
            .andExpect(jsonPath("$.body").value("Test body content"))
            .andExpect(jsonPath("$.user.id").value(USER_ID))
            .andExpect(jsonPath("$.user.username").value("testuser"));
    }

    @Test
    @DisplayName("POST /api/v1/posts - should return 400 when title is blank")
    void shouldReturn400WhenTitleIsBlank() throws Exception {
        NewPostDto newPost = new NewPostDto("   ", "Valid body");

        when(
            postService.createPost(any(NewPostDto.class), eq(USER_ID))
        ).thenThrow(
            new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Title cannot be blank"
            )
        );

        mockMvc
            .perform(
                post("/api/v1/posts")
                    .with(authentication(authToken(USER_ID)))
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(newPost))
            )
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/posts - should return 400 when body is blank")
    void shouldReturn400WhenBodyIsBlank() throws Exception {
        NewPostDto newPost = new NewPostDto("Valid Title", "   ");

        when(
            postService.createPost(any(NewPostDto.class), eq(USER_ID))
        ).thenThrow(
            new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Body cannot be blank"
            )
        );

        mockMvc
            .perform(
                post("/api/v1/posts")
                    .with(authentication(authToken(USER_ID)))
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(newPost))
            )
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName(
        "POST /api/v1/posts - should return 400 when title exceeds max length"
    )
    void shouldReturn400WhenTitleTooLong() throws Exception {
        String longTitle = "a".repeat(101);
        NewPostDto newPost = new NewPostDto(longTitle, "Valid body");

        when(
            postService.createPost(any(NewPostDto.class), eq(USER_ID))
        ).thenThrow(
            new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Title cannot be longer than 100 characters"
            )
        );

        mockMvc
            .perform(
                post("/api/v1/posts")
                    .with(authentication(authToken(USER_ID)))
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(newPost))
            )
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName(
        "POST /api/v1/posts - should return 400 when body exceeds max length"
    )
    void shouldReturn400WhenBodyTooLong() throws Exception {
        String longBody = "a".repeat(1001);
        NewPostDto newPost = new NewPostDto("Valid Title", longBody);

        when(
            postService.createPost(any(NewPostDto.class), eq(USER_ID))
        ).thenThrow(
            new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Body cannot be longer than 1000 characters"
            )
        );

        mockMvc
            .perform(
                post("/api/v1/posts")
                    .with(authentication(authToken(USER_ID)))
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(newPost))
            )
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/posts - should return 404 when user not found")
    void shouldReturn404WhenUserNotFound() throws Exception {
        NewPostDto newPost = new NewPostDto("Valid Title", "Valid body");

        when(
            postService.createPost(any(NewPostDto.class), eq(USER_ID))
        ).thenThrow(new NoSuchElementException("No value present"));

        mockMvc
            .perform(
                post("/api/v1/posts")
                    .with(authentication(authToken(USER_ID)))
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(newPost))
            )
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName(
        "POST /api/v1/posts - should pass authenticated user ID to service"
    )
    void shouldPassAuthenticatedUserIdToService() throws Exception {
        String specificUserId = "clerk_specific_789";
        NewPostDto newPost = new NewPostDto("Title", "Body");
        UserDto userDto = new UserDto(specificUserId, "specificuser", "bio");
        PostDto responseDto = new PostDto(userDto, 2L, "Title", "Body");

        when(
            postService.createPost(any(NewPostDto.class), eq(specificUserId))
        ).thenReturn(responseDto);

        mockMvc
            .perform(
                post("/api/v1/posts")
                    .with(authentication(authToken(specificUserId)))
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(newPost))
            )
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.user.id").value(specificUserId));
    }
}
