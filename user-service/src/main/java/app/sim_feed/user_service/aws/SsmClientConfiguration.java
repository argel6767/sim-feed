package app.sim_feed.user_service.aws;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import software.amazon.awssdk.services.ssm.SsmClient;

@Configuration
@Profile("prod")
public class SsmClientConfiguration {
    
    @Bean
    SsmClient ssmClient() {
        return SsmClient.builder().build();
    }
}