package com.krushimart.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

@Configuration
@Profile("dev")
public class DevSeedFlywayConfig {

    @Bean
    public FlywayMigrationStrategy devSeedMigrationStrategy(DataSource dataSource) {
        return flyway -> {
            flyway.migrate();
            Flyway.configure()
                    .dataSource(dataSource)
                    .locations("classpath:db/seed")
                    .table("flyway_dev_seed_history")
                    .baselineOnMigrate(true)
                    .load()
                    .migrate();
        };
    }
}
