package com.interview.service;

/**
 * Manages API request rate limits for clients.
 */
public interface ApiRateLimitService {

	/**
	 * Determines whether a client is allowed to make another request.
	 *
	 * @param clientKey   unique key identifying the client and API endpoint
	 * @param maxRequests maximum requests allowed within the time window
	 * @return {@code true} when the request is allowed
	 */
	boolean isAllowed(String clientKey, int maxRequests);
}