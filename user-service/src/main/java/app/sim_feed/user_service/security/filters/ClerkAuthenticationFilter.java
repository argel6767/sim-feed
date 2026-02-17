package app.sim_feed.user_service.security.filters;

import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

import com.clerk.backend_api.helpers.security.AuthenticateRequest;
import com.clerk.backend_api.helpers.security.models.AuthenticateRequestOptions;
import com.clerk.backend_api.helpers.security.models.RequestState;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.io.IOException;
import java.util.Map;
import java.util.List;
import java.util.Collections;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("clerkAuthenticationFilter")
@RequiredArgsConstructor
@Setter
public class ClerkAuthenticationFilter extends OncePerRequestFilter{

    private final AuthenticateRequestOptions authenticateRequestOptions;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
                
        Map<String, List<String>> headers = Collections.list(request.getHeaderNames()).stream()
            .collect(Collectors.toMap(
                headerName -> headerName,
                headerName -> Collections.list(request.getHeaders(headerName))
            ));
        
        try {
            RequestState requestState = AuthenticateRequest.authenticateRequest(headers, authenticateRequestOptions);
            
            if (requestState.isSignedIn()) {
                
                Claims claims = requestState.claims().get();
                UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                    claims.getSubject(),
                    null,
                    Collections.emptyList()
                );
                SecurityContextHolder.getContext().setAuthentication(token);
            }
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
        }
        
        filterChain.doFilter(request, response);
    }
    
}