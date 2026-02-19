package app.sim_feed.user_service.security;

import com.clerk.backend_api.helpers.security.models.AuthenticateRequestOptions;

import app.sim_feed.user_service.aws.models.ClerkProperties;
import lombok.Setter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.beans.factory.annotation.Value;

@Configuration
@Setter
public class AuthenticateRequestOptionsConfiguration {
    
    @Value("${clerk.secret.key}")
    private String clerkSecretKey;
    
    @Value("${sim.feed.domain}")
    private String simFeedDomain;

    @Profile("!prod")
    @Bean
    public AuthenticateRequestOptions devAuthenticateRequestOptions() {
        return AuthenticateRequestOptions.secretKey(clerkSecretKey).authorizedParty(simFeedDomain).build();
    }
    
    @Profile("prod")
    @Bean
    public AuthenticateRequestOptions prodAuthenticateRequestOptions(ClerkProperties clerkProperties) {
        return AuthenticateRequestOptions.secretKey(clerkProperties.clerkSecretKey()).authorizedParty(simFeedDomain).build();
    }
}
