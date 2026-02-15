package app.sim_feed.user_service.security;

import com.clerk.backend_api.helpers.security.models.AuthenticateRequestOptions;

import lombok.Setter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

@Configuration
@Setter
public class AuthenticateRequestOptionsConfiguration {
    
    @Value("${clerk.secret.key}")
    private String clerkSecretKey;
    
    @Value("${sim.feed.domain}")
    private String simFeedDomain;

    @Bean
    public AuthenticateRequestOptions authenticateRequestOptions() {
        return AuthenticateRequestOptions.secretKey(clerkSecretKey).authorizedParty(simFeedDomain).build();
    }
}
