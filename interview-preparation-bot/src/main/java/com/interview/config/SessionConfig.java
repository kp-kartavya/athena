package com.interview.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.jdbc.PostgreSqlJdbcIndexedSessionRepositoryCustomizer;

/**
 * Configures PostgreSQL-specific behavior for Spring Session JDBC.
 *
 * PostgreSQL can receive concurrent updates to the same HTTP session attribute
 * when multiple requests are processed at the same time. The built-in Spring
 * Session PostgreSQL customizer applies PostgreSQL-compatible SQL to handle
 * these concurrent updates safely.
 */
@Configuration
public class SessionConfig {

	@Bean
	PostgreSqlJdbcIndexedSessionRepositoryCustomizer postgreSqlJdbcIndexedSessionRepositoryCustomizer() {
		return new PostgreSqlJdbcIndexedSessionRepositoryCustomizer();
	}
}