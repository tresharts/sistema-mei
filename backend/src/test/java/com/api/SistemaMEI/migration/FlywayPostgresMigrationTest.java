package com.api.SistemaMEI.migration;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Testcontainers(disabledWithoutDocker = true)
class FlywayPostgresMigrationTest {

    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Test
    void deveAplicarMigrationsNoPostgresSemCascadeNaFkDeCategoria() throws Exception {
        Flyway flyway = Flyway
            .configure()
            .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
            .locations("classpath:db/migration")
            .load();

        flyway.migrate();

        try (
            Connection connection = DriverManager.getConnection(
                postgres.getJdbcUrl(),
                postgres.getUsername(),
                postgres.getPassword()
            );
            Statement statement = connection.createStatement()
        ) {
            try (ResultSet rs = statement.executeQuery("""
                SELECT delete_rule
                FROM information_schema.referential_constraints
                WHERE constraint_name = 'fk_movimentacao_categoria'
                """)) {
                assertTrue(rs.next());
                assertEquals("NO ACTION", rs.getString("delete_rule"));
            }
        }
    }
}
