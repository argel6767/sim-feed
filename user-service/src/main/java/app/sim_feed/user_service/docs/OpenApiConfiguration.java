package app.sim_feed.user_service.docs;

import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import app.sim_feed.user_service.exceptions.FailedRequestDto;
import io.swagger.v3.core.converter.ModelConverters;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;

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

    @Bean
    OpenApiCustomizer globalResponseCustomizer() {
        Map<String, String> globalResponses = Map.of(
            "400", "Bad Request",
            "404", "Not Found",
            "429", "Too Many Requests - Rate limit exceeded",
            "500", "Internal Server Error"
        );

        return openApi -> {
            Schema<?> failedRequestSchema = ModelConverters.getInstance()
                .read(FailedRequestDto.class)
                .get("FailedRequestDto");

            openApi.getComponents()
                .addSchemas("FailedRequestDto", failedRequestSchema);

            openApi.getPaths().values().forEach(pathItem ->
                pathItem.readOperations().forEach(operation -> {
                    ApiResponses responses = operation.getResponses();
                    globalResponses.forEach((code, description) -> {
                        if (!responses.containsKey(code)) {
                            responses.addApiResponse(code,
                                new ApiResponse()
                                    .description(description)
                                    .content(new Content()
                                        .addMediaType("application/json",
                                            new MediaType().schema(
                                                new Schema<>().$ref(
                                                    "#/components/schemas/FailedRequestDto"
                                                )
                                            )
                                        )
                                    )
                            );
                        }
                    });
                })
            );
        };
    }
}