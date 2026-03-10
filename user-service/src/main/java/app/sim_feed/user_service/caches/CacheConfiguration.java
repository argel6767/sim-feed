package app.sim_feed.user_service.caches;

import java.util.concurrent.TimeUnit;

import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.support.SimpleCacheManager;
import java.util.List;
import org.springframework.cache.caffeine.CaffeineCache;

@Configuration
public class CacheConfiguration {
    
    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(List.of(
            buildCache("followExists", 500, 5),
            buildCache("follows", 1000, 10),
            buildCache("followers", 1000, 10),
            buildCache("user-stats", 1000, 10)
        ));
        return manager;
    }

    private CaffeineCache buildCache(String name, int maxSize, int ttlMinutes) {
        return new CaffeineCache(
            name,
            Caffeine.newBuilder()
            .maximumSize(maxSize)
            .expireAfterWrite(ttlMinutes, TimeUnit.MINUTES)
            .build()
        );
    }
}