package com.interview.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * Stores request counters for API rate limiting.
 *
 * <p>
 * The counter is shared through the database so that rate limiting remains
 * consistent when multiple backend instances are running.
 * </p>
 */
@Data
@Entity
@Table(name = "api_rate_limits")
public class ApiRateLimit {

	@Id
	private String clientKey;

	private LocalDateTime windowStart;

	private int requestCount;
}