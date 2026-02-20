package app.sim_feed.user_service.aws;

import javax.sql.DataSource;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import app.sim_feed.user_service.aws.models.DatabaseProperties;

@Configuration
@Profile("prod")
public class RDSDataSourceConfiguration {
    
    @Bean
    public DataSource dataSource(DatabaseProperties databaseProperties) {
        return DataSourceBuilder.create()
                .url(databaseProperties.databaseUrl())
                .username(databaseProperties.username())
                .password(databaseProperties.password())
                .build();
    }
}