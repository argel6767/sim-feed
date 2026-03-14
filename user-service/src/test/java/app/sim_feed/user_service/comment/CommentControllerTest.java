package app.sim_feed.user_service.comment;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Collections;

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

import app.sim_feed.user_service.comment.models.CommentDto;
import app.sim_feed.user_service.comment.models.NewCommentDto;
import app.sim_feed.user_service.users.models.UserDto;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import org.springframework.context.annotation.Import;
import app.sim_feed.user_service.caches.CacheConfiguration;

@org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest(CommentController.class)
@Import(CacheConfiguration.class)
class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private CommentService commentService;

    @MockitoBean
    private AuthenticateRequestOptions authenticateRequestOptions;

    private static final String USER_ID = "clerk_user_123";
    private static final Long POST_ID = 1L;
    private static final Long COMMENT_ID = 10L;

    private UsernamePasswordAuthenticationToken authToken(String userId) {
        return new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());
    }

    // --- POST /api/v1/comments ---

    @Test
    @DisplayName("POST /api/v1/comments - should return 200 when creating a comment")
    void shouldReturn200WhenCreatingComment() throws Exception {
        NewCommentDto newCommentDto = new NewCommentDto(POST_ID, "This is a comment body");
        CommentDto responseDto = new CommentDto(
                COMMENT_ID,
                POST_ID,
                new UserDto(USER_ID, "testuser", "test bio", "image.com"),
                "This is a comment body"
        );

        when(commentService.createComment(any(NewCommentDto.class), eq(USER_ID))).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/comments")
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCommentDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.commentId").value(COMMENT_ID))
                .andExpect(jsonPath("$.postId").value(POST_ID))
                .andExpect(jsonPath("$.commentAuthor.id").value(USER_ID))
                .andExpect(jsonPath("$.body").value("This is a comment body"));
    }

    @Test
    @DisplayName("POST /api/v1/comments - should return 400 when comment body is empty")
    void shouldReturn400WhenCommentBodyIsEmpty() throws Exception {
        NewCommentDto newCommentDto = new NewCommentDto(POST_ID, "");

        when(commentService.createComment(any(NewCommentDto.class), eq(USER_ID)))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment body cannot be empty"));

        mockMvc.perform(post("/api/v1/comments")
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCommentDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/comments - should return 400 when comment body is null")
    void shouldReturn400WhenCommentBodyIsNull() throws Exception {
        NewCommentDto newCommentDto = new NewCommentDto(POST_ID, null);

        when(commentService.createComment(any(NewCommentDto.class), eq(USER_ID)))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment body cannot be empty"));

        mockMvc.perform(post("/api/v1/comments")
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCommentDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/comments - should return 400 when comment body exceeds 1000 characters")
    void shouldReturn400WhenCommentBodyTooLong() throws Exception {
        String longBody = "a".repeat(1001);
        NewCommentDto newCommentDto = new NewCommentDto(POST_ID, longBody);

        when(commentService.createComment(any(NewCommentDto.class), eq(USER_ID)))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment body cannot exceed 1000 characters"));

        mockMvc.perform(post("/api/v1/comments")
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCommentDto)))
                .andExpect(status().isBadRequest());
    }

    // --- PUT /api/v1/comments/{commentId} ---

    @Test
    @DisplayName("PUT /api/v1/comments/{commentId} - should return 200 when updating a comment")
    void shouldReturn200WhenUpdatingComment() throws Exception {
        UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
        CommentDto updatedComment = new CommentDto(COMMENT_ID, POST_ID, userDto, "Updated comment body");

        when(commentService.updateComment(eq(COMMENT_ID), any(CommentDto.class), eq(USER_ID)))
                .thenReturn(updatedComment);

        mockMvc.perform(put("/api/v1/comments/{commentId}", COMMENT_ID)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedComment)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.commentId").value(COMMENT_ID))
                .andExpect(jsonPath("$.postId").value(POST_ID))
                .andExpect(jsonPath("$.commentAuthor.id").value(USER_ID))
                .andExpect(jsonPath("$.body").value("Updated comment body"));
    }

    @Test
    @DisplayName("PUT /api/v1/comments/{commentId} - should return 400 when commentId in path mismatches body")
    void shouldReturn400WhenCommentIdMismatch() throws Exception {
        UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
        CommentDto mismatchedComment = new CommentDto(999L, POST_ID, userDto, "Updated body");

        when(commentService.updateComment(eq(COMMENT_ID), any(CommentDto.class), eq(USER_ID)))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Comment ID in the path does not match the comment ID in the request body"));

        mockMvc.perform(put("/api/v1/comments/{commentId}", COMMENT_ID)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mismatchedComment)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/v1/comments/{commentId} - should return 401 when user is not the comment author")
    void shouldReturn401WhenUserIsNotCommentAuthor() throws Exception {
        UserDto userDto = new UserDto(USER_ID, "testuser", "test bio", "image.com");
        CommentDto updatedComment = new CommentDto(COMMENT_ID, POST_ID, userDto, "Updated body");

        when(commentService.updateComment(eq(COMMENT_ID), any(CommentDto.class), eq(USER_ID)))
                .thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "User is not the author of this comment"));

        mockMvc.perform(put("/api/v1/comments/{commentId}", COMMENT_ID)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedComment)))
                .andExpect(status().isUnauthorized());
    }

    // --- DELETE /api/v1/comments/{commentId} ---

    @Test
    @DisplayName("DELETE /api/v1/comments/{commentId} - should return 200 when deleting own comment")
    void shouldReturn200WhenDeletingOwnComment() throws Exception {
        doNothing().when(commentService).deleteComment(eq(COMMENT_ID), eq(USER_ID));

        mockMvc.perform(delete("/api/v1/comments/{commentId}", COMMENT_ID)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("DELETE /api/v1/comments/{commentId} - should return 401 when user is not the comment author")
    void shouldReturn401WhenDeletingOthersComment() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not the author of this comment"))
                .when(commentService).deleteComment(eq(COMMENT_ID), eq(USER_ID));

        mockMvc.perform(delete("/api/v1/comments/{commentId}", COMMENT_ID)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DELETE /api/v1/comments/{commentId} - should return 204 when comment not found")
    void shouldReturn204WhenCommentNotFound() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.NO_CONTENT, ""))
                .when(commentService).deleteComment(eq(999L), eq(USER_ID));

        mockMvc.perform(delete("/api/v1/comments/{commentId}", 999L)
                        .with(authentication(authToken(USER_ID)))
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
