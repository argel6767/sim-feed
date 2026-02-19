package app.sim_feed.user_service;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping()
public class RootController {
    @RequestMapping("/")
    public Map<String, String> index() {
        return Map.of("message", "Welcome to the Sim-Feed's User Service!", "status", "OK");
    }
}
