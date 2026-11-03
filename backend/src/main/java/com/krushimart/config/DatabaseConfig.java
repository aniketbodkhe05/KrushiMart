package com.krushimart.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource(
            @Value("${DATABASE_URL:}") String databaseUrl,
            @Value("${DB_URL:jdbc:postgresql://localhost:5432/krushimart}") String dbUrl,
            @Value("${DB_USERNAME:krushimart}") String dbUsername,
            @Value("${DB_PASSWORD:krushimart_dev}") String dbPassword) {
        if (databaseUrl != null && !databaseUrl.isBlank()) {
            try {
                URI uri = new URI(databaseUrl.replace("postgres://", "postgresql://"));
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                String dbName = (path == null || path.length() <= 1) ? "krushimart" : path.substring(1);
                String userInfo = uri.getUserInfo();
                String username = dbUsername;
                String password = dbPassword;
                if (userInfo != null) {
                    String[] parts = userInfo.split(":", 2);
                    if (parts.length > 0 && !parts[0].isBlank()) username = parts[0];
                    if (parts.length > 1) password = parts[1];
                }
                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbName
                        + "?sslmode=require";
                return DataSourceBuilder.create()
                        .url(jdbcUrl)
                        .username(username)
                        .password(password)
                        .driverClassName("org.postgresql.Driver")
                        .build();
            } catch (Exception ignored) {
                // fall through to explicit DB_* configuration
            }
        }
        return DataSourceBuilder.create()
                .url(dbUrl)
                .username(dbUsername)
                .password(dbPassword)
                .driverClassName("org.postgresql.Driver")
                .build();
    }
}
