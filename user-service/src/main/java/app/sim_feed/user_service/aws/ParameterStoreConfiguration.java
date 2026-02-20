package app.sim_feed.user_service.aws;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import app.sim_feed.user_service.aws.models.DatabaseProperties;
import app.sim_feed.user_service.aws.models.ClerkProperties;
import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.ssm.SsmClient;
import software.amazon.awssdk.services.ssm.model.GetParametersResponse;

import java.util.Map;
import software.amazon.awssdk.services.ssm.model.Parameter;
import java.util.stream.Collectors;

@Configuration
@RequiredArgsConstructor
@Profile("prod")
public class ParameterStoreConfiguration {
    
    private final SsmClient ssmClient;
    
    @Value("${ssm.database.url.name}")
    private String databaseUrlName;
    
    @Value("${ssm.database.username.name}")
    private String databaseUsernameName;
    
    @Value("${ssm.database.password.name}")
    private String databasePasswordName;
    
    @Value("${ssm.clerk.secret.key.name}")
    private String clerkSecretKeyName;
    
    @Bean
    public DatabaseProperties databaseProperties() {
        Map<String, String> parameters = fetchParameters(databaseUrlName, databaseUsernameName, databasePasswordName);
        return new DatabaseProperties(parameters.get(databaseUrlName), parameters.get(databaseUsernameName), parameters.get(databasePasswordName));
    }
    
    @Bean
    public ClerkProperties clerkProperties() {
        Map<String, String> parameters = fetchParameters(clerkSecretKeyName);
        return new ClerkProperties(parameters.get(clerkSecretKeyName));
    }
    
    private Map<String, String> fetchParameters(String... parameterNames) {
        GetParametersResponse response = ssmClient.getParameters(r ->
            r.names(parameterNames).withDecryption(true));
        
        return response.parameters().stream()
            .collect(Collectors.toMap(Parameter::name, Parameter::value));
    }
}