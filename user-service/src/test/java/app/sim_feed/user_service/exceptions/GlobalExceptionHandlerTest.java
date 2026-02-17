package app.sim_feed.user_service.exceptions;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.NoSuchElementException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletRequest;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler globalExceptionHandler;
    private HttpServletRequest mockRequest;

    @BeforeEach
    void setUp() {
        globalExceptionHandler = new GlobalExceptionHandler();
        mockRequest = mock(HttpServletRequest.class);
        when(mockRequest.getRequestURI()).thenReturn("/api/v1/test");
    }

    @Nested
    @DisplayName("handleNoSuchElementException")
    class HandleNoSuchElementException {

        @Test
        @DisplayName("should return 404 status code")
        void shouldReturn404StatusCode() {
            NoSuchElementException exception = new NoSuchElementException("Element not found");

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleNoSuchElementException(exception, mockRequest);

            assertThat(response.getStatusCode().value()).isEqualTo(404);
        }

        @Test
        @DisplayName("should return body with exception message")
        void shouldReturnBodyWithExceptionMessage() {
            NoSuchElementException exception = new NoSuchElementException("User not found");

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleNoSuchElementException(exception, mockRequest);

            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().message()).isEqualTo("User not found");
        }

        @Test
        @DisplayName("should return body with correct status code field")
        void shouldReturnBodyWithCorrectStatusCodeField() {
            NoSuchElementException exception = new NoSuchElementException("Not found");

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleNoSuchElementException(exception, mockRequest);

            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().statusCode()).isEqualTo(404);
        }

        @Test
        @DisplayName("should return body with request URI")
        void shouldReturnBodyWithRequestUri() {
            NoSuchElementException exception = new NoSuchElementException("Not found");

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleNoSuchElementException(exception, mockRequest);

            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().requestUri()).isEqualTo("/api/v1/test");
        }

        @Test
        @DisplayName("should handle null message in exception")
        void shouldHandleNullMessage() {
            NoSuchElementException exception = new NoSuchElementException();

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleNoSuchElementException(exception, mockRequest);

            assertThat(response.getStatusCode().value()).isEqualTo(404);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().message()).isNull();
        }

        @Test
        @DisplayName("should use different request URIs correctly")
        void shouldUseDifferentRequestUris() {
            when(mockRequest.getRequestURI()).thenReturn("/api/v1/users/clerk_123");
            NoSuchElementException exception = new NoSuchElementException("User not found");

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleNoSuchElementException(exception, mockRequest);

            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().requestUri()).isEqualTo("/api/v1/users/clerk_123");
        }
    }

    @Nested
    @DisplayName("handleIllegalArgumentException")
    class HandleIllegalArgumentException {

        @Test
        @DisplayName("should return 400 status code")
        void shouldReturn400StatusCode() {
            IllegalArgumentException exception = new IllegalArgumentException("Invalid argument");

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleIllegalArgumentException(exception, mockRequest);

            assertThat(response.getStatusCode().value()).isEqualTo(400);
        }

        @Test
        @DisplayName("should return body with exception message")
        void shouldReturnBodyWithExceptionMessage() {
            IllegalArgumentException exception = new IllegalArgumentException("Username cannot be empty");

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleIllegalArgumentException(exception, mockRequest);

            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().message()).isEqualTo("Username cannot be empty");
        }

        @Test
        @DisplayName("should return body with correct status code field")
        void shouldReturnBodyWithCorrectStatusCodeField() {
            IllegalArgumentException exception = new IllegalArgumentException("Bad input");

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleIllegalArgumentException(exception, mockRequest);

            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().statusCode()).isEqualTo(400);
        }

        @Test
        @DisplayName("should return body with request URI")
        void shouldReturnBodyWithRequestUri() {
            IllegalArgumentException exception = new IllegalArgumentException("Bad input");

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleIllegalArgumentException(exception, mockRequest);

            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().requestUri()).isEqualTo("/api/v1/test");
        }

        @Test
        @DisplayName("should handle null message in exception")
        void shouldHandleNullMessage() {
            IllegalArgumentException exception = new IllegalArgumentException();

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleIllegalArgumentException(exception, mockRequest);

            assertThat(response.getStatusCode().value()).isEqualTo(400);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().message()).isNull();
        }
    }

    @Nested
    @DisplayName("handleException (generic)")
    class HandleGenericException {

        @Test
        @DisplayName("should return 500 status code")
        void shouldReturn500StatusCode() {
            Exception exception = new Exception("Something went wrong");

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleException(exception, mockRequest);

            assertThat(response.getStatusCode().value()).isEqualTo(500);
        }

        @Test
        @DisplayName("should return body with exception message")
        void shouldReturnBodyWithExceptionMessage() {
            Exception exception = new Exception("Internal server error occurred");

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleException(exception, mockRequest);

            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().message()).isEqualTo("Internal server error occurred");
        }

        @Test
        @DisplayName("should return body with correct status code field")
        void shouldReturnBodyWithCorrectStatusCodeField() {
            Exception exception = new Exception("Error");

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleException(exception, mockRequest);

            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().statusCode()).isEqualTo(500);
        }

        @Test
        @DisplayName("should return body with request URI")
        void shouldReturnBodyWithRequestUri() {
            Exception exception = new Exception("Error");

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleException(exception, mockRequest);

            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().requestUri()).isEqualTo("/api/v1/test");
        }

        @Test
        @DisplayName("should handle null message in exception")
        void shouldHandleNullMessage() {
            Exception exception = new Exception();

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleException(exception, mockRequest);

            assertThat(response.getStatusCode().value()).isEqualTo(500);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().message()).isNull();
        }

        @Test
        @DisplayName("should handle RuntimeException as generic exception")
        void shouldHandleRuntimeException() {
            RuntimeException exception = new RuntimeException("Unexpected runtime error");

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleException(exception, mockRequest);

            assertThat(response.getStatusCode().value()).isEqualTo(500);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().message()).isEqualTo("Unexpected runtime error");
        }

        @Test
        @DisplayName("should handle NullPointerException as generic exception")
        void shouldHandleNullPointerException() {
            NullPointerException exception = new NullPointerException("Null pointer encountered");

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleException(exception, mockRequest);

            assertThat(response.getStatusCode().value()).isEqualTo(500);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().message()).isEqualTo("Null pointer encountered");
        }

        @Test
        @DisplayName("should use different request URIs correctly")
        void shouldUseDifferentRequestUris() {
            when(mockRequest.getRequestURI()).thenReturn("/api/v1/posts");
            Exception exception = new Exception("Failed to create post");

            ResponseEntity<FailedRequestDto> response = globalExceptionHandler
                    .handleException(exception, mockRequest);

            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().requestUri()).isEqualTo("/api/v1/posts");
        }
    }

    @Nested
    @DisplayName("FailedRequestDto")
    class FailedRequestDtoTests {

        @Test
        @DisplayName("should correctly store message, statusCode, and requestUri")
        void shouldCorrectlyStoreFields() {
            FailedRequestDto dto = new FailedRequestDto("error message", 404, "/api/v1/test");

            assertThat(dto.message()).isEqualTo("error message");
            assertThat(dto.statusCode()).isEqualTo(404);
            assertThat(dto.requestUri()).isEqualTo("/api/v1/test");
        }

        @Test
        @DisplayName("should support null message")
        void shouldSupportNullMessage() {
            FailedRequestDto dto = new FailedRequestDto(null, 500, "/api/v1/test");

            assertThat(dto.message()).isNull();
            assertThat(dto.statusCode()).isEqualTo(500);
            assertThat(dto.requestUri()).isEqualTo("/api/v1/test");
        }

        @Test
        @DisplayName("should implement equals based on record semantics")
        void shouldImplementEqualsBasedOnRecordSemantics() {
            FailedRequestDto dto1 = new FailedRequestDto("error", 404, "/api/v1/test");
            FailedRequestDto dto2 = new FailedRequestDto("error", 404, "/api/v1/test");

            assertThat(dto1).isEqualTo(dto2);
        }

        @Test
        @DisplayName("should not be equal when fields differ")
        void shouldNotBeEqualWhenFieldsDiffer() {
            FailedRequestDto dto1 = new FailedRequestDto("error1", 404, "/api/v1/test");
            FailedRequestDto dto2 = new FailedRequestDto("error2", 500, "/api/v1/other");

            assertThat(dto1).isNotEqualTo(dto2);
        }

        @Test
        @DisplayName("should implement consistent hashCode for equal records")
        void shouldImplementConsistentHashCode() {
            FailedRequestDto dto1 = new FailedRequestDto("error", 404, "/api/v1/test");
            FailedRequestDto dto2 = new FailedRequestDto("error", 404, "/api/v1/test");

            assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
        }

        @Test
        @DisplayName("should implement toString with record format")
        void shouldImplementToString() {
            FailedRequestDto dto = new FailedRequestDto("error", 404, "/api/v1/test");

            String toString = dto.toString();
            assertThat(toString).contains("error");
            assertThat(toString).contains("404");
            assertThat(toString).contains("/api/v1/test");
        }
    }
}
