package app.sim_feed.user_service.docs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration 
public class OpenApiConfiguration {
    
    @Bean
    OpenAPI openApi() {
        return new OpenAPI()
        .addSecurityItem(new SecurityRequirement().addList("Bearer"))
        .components(new Components()
            .addSecuritySchemes("Bearer", new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")));
    }
}
