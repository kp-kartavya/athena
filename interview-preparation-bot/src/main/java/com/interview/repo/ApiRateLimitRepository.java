package com.interview.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.interview.model.ApiRateLimit;

/**
 * Provides database access for API rate-limit counters.
 */
public interface ApiRateLimitRepository extends JpaRepository<ApiRateLimit, String> {

	/**
	 * Acquires a PostgreSQL transaction-level advisory lock for a client key.
	 *
	 * @param clientKey unique key identifying the client and API endpoint
	 */
	@Query(value = "SELECT pg_advisory_xact_lock(hashtext(:clientKey))", nativeQuery = true)
	void acquireLock(@Param("clientKey") String clientKey);
}