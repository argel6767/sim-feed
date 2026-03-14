package app.sim_feed.user_service.like;

import app.sim_feed.user_service.caches.CacheConfiguration;
import org.springframework.context.annotation.Import;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import com.clerk.backend_api.helpers.security.models.AuthenticateRequestOptions;
import com.fasterxml.jackson.databind.ObjectMapper;

import app.sim_feed.user_service.like.models.LikeDto;
import app.sim_feed.user_service.like.models.NewLikeDto;
import app.sim_feed.user_service.post.models.PostDto;
import app.sim_feed.user_service.users.models.UserDto;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest(LikeController.class)
@Import(CacheConfiguration.class)
class LikeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private LikeService likeService;

    @MockitoBean
    private AuthenticateRequestOptions authenticateRequestOptions;

    private static final String USER_ID = "clerk_user_123";
    private static final Long POST_ID = 1L;
    private static final Long LIKE_ID = 10L;

    private UsernamePasswordAuthenticationToken authToken(String userId) {
        return new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());
    }

    private UserDto userDto() {
        return new UserDto(USER_ID, "testuser", "test bio", "image.com");
    }

    private PostDto postDto() {
        return new PostDto(userDto(), POST_ID, "Test Post", "Test post body");
    }

    // --- POST /api/v1/likes ---

    @Test
    @DisplayName("POST /api/v1/likes - should return 200 when liking a post")
    void shouldReturn200WhenLikingPost() throws Exception {
        NewLikeDto newLikeDto = new NewLikeDto(POST_ID, null, null);
        LikeDto responseDto = new LikeDto(LIKE_ID, postDto(), userDto(), null);

        when(likeService.like(any(NewLikeDto.class), eq(USER_ID))).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/likes")
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newLikeDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(LIKE_ID))
                .andExpect(jsonPath("$.post.id").value(POST_ID))
                .andExpect(jsonPath("$.user.id").value(USER_ID))
                .andExpect(jsonPath("$.persona").isEmpty());
    }

    @Test
    @DisplayName("POST /api/v1/likes - should return 401 when user is unauthenticated")
    void shouldReturn401WhenUnauthenticated() throws Exception {
        NewLikeDto newLikeDto = new NewLikeDto(POST_ID, null, null);

        mockMvc.perform(post("/api/v1/likes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newLikeDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/likes - should return 404 when post does not exist")
    void shouldReturn404WhenPostDoesNotExist() throws Exception {
        NewLikeDto newLikeDto = new NewLikeDto(999L, null, null);

        when(likeService.like(any(NewLikeDto.class), eq(USER_ID)))
                .thenThrow(new NoSuchElementException());

        mockMvc.perform(post("/api/v1/likes")
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newLikeDto)))
                .andExpect(status().is4xxClientError());
    }

    // --- DELETE /api/v1/likes/{likeId} ---

    @Test
    @DisplayName("DELETE /api/v1/likes/{likeId} - should return 200 when unliking own like")
    void shouldReturn200WhenUnlikingOwnLike() throws Exception {
        doNothing().when(likeService).unlike(eq(LIKE_ID), eq(USER_ID));

        mockMvc.perform(delete("/api/v1/likes/{likeId}", LIKE_ID)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("DELETE /api/v1/likes/{likeId} - should return 401 when user is not the like author")
    void shouldReturn401WhenUserIsNotLikeAuthor() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not the author of this like"))
                .when(likeService).unlike(eq(LIKE_ID), eq(USER_ID));

        mockMvc.perform(delete("/api/v1/likes/{likeId}", LIKE_ID)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DELETE /api/v1/likes/{likeId} - should return 204 when like not found")
    void shouldReturn204WhenLikeNotFound() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.NO_CONTENT, ""))
                .when(likeService).unlike(eq(999L), eq(USER_ID));

        mockMvc.perform(delete("/api/v1/likes/{likeId}", 999L)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    // --- GET /api/v1/likes ---

    @Test
    @DisplayName("GET /api/v1/likes - should return 200 with a page of likes")
    void shouldReturn200WithPageOfLikes() throws Exception {
        List<LikeDto> likeList = List.of(
                new LikeDto(LIKE_ID, postDto(), userDto(), null),
                new LikeDto(LIKE_ID + 1, postDto(), userDto(), null)
        );
        Page<LikeDto> likePage = new PageImpl<>(likeList);

        when(likeService.getUserLikes(eq(0), eq(15), eq(USER_ID))).thenReturn(likePage);

        mockMvc.perform(get("/api/v1/likes")
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].id").value(LIKE_ID))
                .andExpect(jsonPath("$.content[0].user.id").value(USER_ID))
                .andExpect(jsonPath("$.content[1].id").value(LIKE_ID + 1));
    }

    @Test
    @DisplayName("GET /api/v1/likes - should return 200 with empty page when user has no likes")
    void shouldReturn200WithEmptyPageWhenNoLikes() throws Exception {
        Page<LikeDto> emptyPage = new PageImpl<>(Collections.emptyList());

        when(likeService.getUserLikes(eq(0), eq(15), eq(USER_ID))).thenReturn(emptyPage);

        mockMvc.perform(get("/api/v1/likes")
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(0))
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @DisplayName("GET /api/v1/likes - should pass custom page and size parameters to service")
    void shouldPassCustomPageAndSizeToService() throws Exception {
        Page<LikeDto> likePage = new PageImpl<>(Collections.emptyList());

        when(likeService.getUserLikes(eq(2), eq(5), eq(USER_ID))).thenReturn(likePage);

        mockMvc.perform(get("/api/v1/likes")
                        .param("page", "2")
                        .param("size", "5")
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf()))
                .andExpect(status().isOk());
    }
}
