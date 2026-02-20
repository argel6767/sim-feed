package app.sim_feed.user_service;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.resilience4j.ratelimiter.annotation.RateLimiter;

import java.util.Map;

@RestController
@RequestMapping()
public class RootController {
    @RequestMapping("/")
    @RateLimiter(name = "api-limiter")
    public Map<String, String> index() {
        return Map.of("message", "Welcome to the Sim-Feed's User Service!", "status", "OK");
    }
}
