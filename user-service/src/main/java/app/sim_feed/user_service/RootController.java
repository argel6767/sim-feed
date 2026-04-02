package app.sim_feed.user_service;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.swagger.v3.oas.annotations.Hidden;

import java.util.Map;

@RestController
public class RootController {
    
    @Hidden
    @GetMapping("/")
    @RateLimiter(name = "api-limiter")
    public Map<String, String> index() {
        return Map.of("message", "Welcome to the Sim-Feed's User Service!", "status", "OK");
    }
}
