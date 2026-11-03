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
            @Value("${JDBC_DATABASE_URL:}") String jdbcDatabaseUrl,
            @Value("${DB_URL:}") String dbUrl,
            @Value("${DB_USERNAME:krushimart}") String dbUsername,
            @Value("${DB_PASSWORD:krushimart_dev}") String dbPassword) {
        String resolvedUrl = firstNonBlank(databaseUrl, jdbcDatabaseUrl, dbUrl);
        boolean onRender = !System.getenv().getOrDefault("RENDER", "").isBlank();
        if (resolvedUrl == null || resolvedUrl.isBlank()) {
            if (onRender) {
                throw new IllegalStateException("Database URL is not configured. Set DATABASE_URL or DB_URL on Render.");
            }
            resolvedUrl = "jdbc:postgresql://localhost:5432/krushimart";
        }
        if (onRender && resolvedUrl.contains("localhost")) {
            throw new IllegalStateException("Database URL resolves to localhost on Render. Set DATABASE_URL or DB_URL to the Render PostgreSQL connection string.");
        }
        if (resolvedUrl.startsWith("postgres")) {
            try {
                URI uri = new URI(resolvedUrl.replace("postgres://", "postgresql://"));
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
                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbName;
                return DataSourceBuilder.create()
                        .url(jdbcUrl)
                        .username(username)
                        .password(password)
                        .driverClassName("org.postgresql.Driver")
                        .build();
            } catch (Exception ignored) {
                // fall through
            }
        }
        String finalUrl = (resolvedUrl == null || resolvedUrl.isBlank())
                ? "jdbc:postgresql://localhost:5432/krushimart" : resolvedUrl;
        return DataSourceBuilder.create()
                .url(finalUrl)
                .username(dbUsername)
                .password(dbPassword)
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) return v;
        }
        return null;
    }
}
