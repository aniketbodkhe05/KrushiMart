package com.krushimart.config;

import com.zaxxer.hikari.HikariDataSource;
import org.junit.jupiter.api.Test;

import javax.sql.DataSource;

import static org.assertj.core.api.Assertions.assertThat;

class DatabaseConfigTest {
    @Test
    void renderDatabaseUrlIsConverted() {
        DatabaseConfig config = new DatabaseConfig();
        DataSource ds = config.dataSource(
                "postgresql://krushimart:secret@db.internal:5432/krushimart",
                "", "", "krushimart", "krushimart_dev");
        assertThat(ds).isInstanceOf(HikariDataSource.class);
        HikariDataSource hds = (HikariDataSource) ds;
        assertThat(hds.getJdbcUrl()).isEqualTo("jdbc:postgresql://db.internal:5432/krushimart");
        assertThat(hds.getUsername()).isEqualTo("krushimart");
        assertThat(hds.getPassword()).isEqualTo("secret");
    }
}

