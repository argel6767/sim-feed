package app.sim_feed.user_service.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.clerk.backend_api.helpers.security.AuthenticateRequest;
import com.clerk.backend_api.helpers.security.models.AuthenticateRequestOptions;
import com.clerk.backend_api.helpers.security.models.RequestState;

import app.sim_feed.user_service.security.filters.ClerkAuthenticationFilter;
import io.jsonwebtoken.Claims;
import jakarta.servlet.ServletException;

@ExtendWith(MockitoExtension.class)
class ClerkAuthenticationFilterTest {

    @Mock
    private AuthenticateRequestOptions authenticateRequestOptions;

    @InjectMocks
    private ClerkAuthenticationFilter clerkAuthenticationFilter;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private MockFilterChain filterChain;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        filterChain = new MockFilterChain();
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Nested
    @DisplayName("doFilter")
    class doFilter {

        @Test
        @DisplayName("should set authentication in SecurityContext when request is signed in")
        void shouldSetAuthenticationWhenSignedIn() throws ServletException, IOException {
            String expectedSubject = "clerk_user_123";
            request.addHeader("Authorization", "Bearer test-token");

            RequestState requestState = mock(RequestState.class);
            Claims claims = mock(Claims.class);

            when(requestState.isSignedIn()).thenReturn(true);
            when(requestState.claims()).thenReturn(Optional.of(claims));
            when(claims.getSubject()).thenReturn(expectedSubject);

            try (MockedStatic<AuthenticateRequest> mockedStatic = Mockito.mockStatic(AuthenticateRequest.class)) {
                mockedStatic.when(() -> AuthenticateRequest.authenticateRequest(any(Map.class), eq(authenticateRequestOptions)))
                        .thenReturn(requestState);

                clerkAuthenticationFilter.doFilter(request, response, filterChain);
            }

            var authentication = SecurityContextHolder.getContext().getAuthentication();
            assertThat(authentication).isNotNull();
            assertThat(authentication).isInstanceOf(UsernamePasswordAuthenticationToken.class);
            assertThat(authentication.getPrincipal()).isEqualTo(expectedSubject);
            assertThat(authentication.getCredentials()).isNull();
            assertThat(authentication.getAuthorities()).isEmpty();
        }

        @Test
        @DisplayName("should not set authentication in SecurityContext when request is not signed in")
        void shouldNotSetAuthenticationWhenNotSignedIn() throws ServletException, IOException {
            RequestState requestState = mock(RequestState.class);
            when(requestState.isSignedIn()).thenReturn(false);

            try (MockedStatic<AuthenticateRequest> mockedStatic = Mockito.mockStatic(AuthenticateRequest.class)) {
                mockedStatic.when(() -> AuthenticateRequest.authenticateRequest(any(Map.class), eq(authenticateRequestOptions)))
                        .thenReturn(requestState);

                clerkAuthenticationFilter.doFilter(request, response, filterChain);
            }

            var authentication = SecurityContextHolder.getContext().getAuthentication();
            assertThat(authentication).isNull();
        }

        @Test
        @DisplayName("should clear SecurityContext and continue filter chain when exception occurs")
        void shouldClearContextOnException() throws ServletException, IOException {
            // Pre-set some authentication to verify it gets cleared
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken("existing_user", null, Collections.emptyList()));

            request.addHeader("Authorization", "Bearer bad-token");

            try (MockedStatic<AuthenticateRequest> mockedStatic = Mockito.mockStatic(AuthenticateRequest.class)) {
                mockedStatic.when(() -> AuthenticateRequest.authenticateRequest(any(Map.class), eq(authenticateRequestOptions)))
                        .thenThrow(new RuntimeException("Authentication failed"));

                clerkAuthenticationFilter.doFilter(request, response, filterChain);
            }

            var authentication = SecurityContextHolder.getContext().getAuthentication();
            assertThat(authentication).isNull();
        }

        @Test
        @DisplayName("should always continue the filter chain even when not signed in")
        void shouldAlwaysContinueFilterChainWhenNotSignedIn() throws ServletException, IOException {
            RequestState requestState = mock(RequestState.class);
            when(requestState.isSignedIn()).thenReturn(false);

            try (MockedStatic<AuthenticateRequest> mockedStatic = Mockito.mockStatic(AuthenticateRequest.class)) {
                mockedStatic.when(() -> AuthenticateRequest.authenticateRequest(any(Map.class), eq(authenticateRequestOptions)))
                        .thenReturn(requestState);

                clerkAuthenticationFilter.doFilter(request, response, filterChain);
            }

            // MockFilterChain stores the request/response if doFilter was called
            assertThat(filterChain.getRequest()).isNotNull();
            assertThat(filterChain.getResponse()).isNotNull();
        }

        @Test
        @DisplayName("should always continue the filter chain even when exception occurs")
        void shouldAlwaysContinueFilterChainOnException() throws ServletException, IOException {
            request.addHeader("Authorization", "Bearer bad-token");

            try (MockedStatic<AuthenticateRequest> mockedStatic = Mockito.mockStatic(AuthenticateRequest.class)) {
                mockedStatic.when(() -> AuthenticateRequest.authenticateRequest(any(Map.class), eq(authenticateRequestOptions)))
                        .thenThrow(new RuntimeException("Authentication failed"));

                clerkAuthenticationFilter.doFilter(request, response, filterChain);
            }

            assertThat(filterChain.getRequest()).isNotNull();
            assertThat(filterChain.getResponse()).isNotNull();
        }

        @Test
        @DisplayName("should always continue the filter chain when signed in")
        void shouldAlwaysContinueFilterChainWhenSignedIn() throws ServletException, IOException {
            String expectedSubject = "clerk_user_456";
            request.addHeader("Authorization", "Bearer valid-token");

            RequestState requestState = mock(RequestState.class);
            Claims claims = mock(Claims.class);

            when(requestState.isSignedIn()).thenReturn(true);
            when(requestState.claims()).thenReturn(Optional.of(claims));
            when(claims.getSubject()).thenReturn(expectedSubject);

            try (MockedStatic<AuthenticateRequest> mockedStatic = Mockito.mockStatic(AuthenticateRequest.class)) {
                mockedStatic.when(() -> AuthenticateRequest.authenticateRequest(any(Map.class), eq(authenticateRequestOptions)))
                        .thenReturn(requestState);

                clerkAuthenticationFilter.doFilter(request, response, filterChain);
            }

            assertThat(filterChain.getRequest()).isNotNull();
            assertThat(filterChain.getResponse()).isNotNull();
        }

        @Test
        @DisplayName("should pass request headers to AuthenticateRequest")
        void shouldPassRequestHeadersToAuthenticateRequest() throws ServletException, IOException {
            request.addHeader("Authorization", "Bearer my-token");
            request.addHeader("X-Custom-Header", "custom-value");

            RequestState requestState = mock(RequestState.class);
            when(requestState.isSignedIn()).thenReturn(false);

            try (MockedStatic<AuthenticateRequest> mockedStatic = Mockito.mockStatic(AuthenticateRequest.class)) {
                @SuppressWarnings("unchecked")
                ArgumentCaptor<Map<String, List<String>>> headersCaptor = ArgumentCaptor.forClass(Map.class);

                mockedStatic.when(() -> AuthenticateRequest.authenticateRequest(headersCaptor.capture(), eq(authenticateRequestOptions)))
                        .thenReturn(requestState);

                clerkAuthenticationFilter.doFilter(request, response, filterChain);

                Map<String, List<String>> capturedHeaders = headersCaptor.getValue();
                assertThat(capturedHeaders).containsKey("Authorization");
                assertThat(capturedHeaders.get("Authorization")).contains("Bearer my-token");
                assertThat(capturedHeaders).containsKey("X-Custom-Header");
                assertThat(capturedHeaders.get("X-Custom-Header")).contains("custom-value");
            }
        }

        @Test
        @DisplayName("should handle request with no headers gracefully")
        void shouldHandleRequestWithNoHeaders() throws ServletException, IOException {
            // Request with no headers at all
            RequestState requestState = mock(RequestState.class);
            when(requestState.isSignedIn()).thenReturn(false);

            try (MockedStatic<AuthenticateRequest> mockedStatic = Mockito.mockStatic(AuthenticateRequest.class)) {
                mockedStatic.when(() -> AuthenticateRequest.authenticateRequest(any(Map.class), eq(authenticateRequestOptions)))
                        .thenReturn(requestState);

                clerkAuthenticationFilter.doFilter(request, response, filterChain);
            }

            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            assertThat(filterChain.getRequest()).isNotNull();
        }
    }
}
