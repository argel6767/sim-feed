package app.sim_feed.user_service.security.filters;

import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import app.sim_feed.user_service.users.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.util.Collections;

@Component("integrationTestAuthenticationFilter")
@Profile("integration-test")
@RequiredArgsConstructor
public class IntegrationTestAuthenticationFilter extends AuthenticationFilter {
    
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
            String authHeader = request.getHeader("Authorization");
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String id = authHeader.substring(7);
                userRepository.findById(id).ifPresent(user -> {
                    UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(user.getClerkId(), 
                        null, Collections.emptyList());
                    SecurityContextHolder.getContext().setAuthentication(token);
                });
            }
            filterChain.doFilter(request, response);
    }
}