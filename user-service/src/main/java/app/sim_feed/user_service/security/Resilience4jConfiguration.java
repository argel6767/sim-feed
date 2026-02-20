package app.sim_feed.user_service.security;

import java.time.Duration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;

@Configuration
public class Resilience4jConfiguration {
    
    @Bean
    public RateLimiterRegistry rateLimiterRegistry() {
        return RateLimiterRegistry.of(RateLimiterConfig.custom()
            .limitRefreshPeriod(Duration.ofMinutes(1))
            .limitForPeriod(100)
            .timeoutDuration(Duration.ofSeconds(5))
            .build()
        );
    }
    
    @Bean
    public RateLimiter rateLimiter(RateLimiterRegistry registry) {
        return registry.rateLimiter("api-limiter");
    }
}