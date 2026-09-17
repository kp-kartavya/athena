package com.interview.service;

/**
 * Verifies Cloudflare Turnstile tokens.
 */
public interface TurnstileService {

	boolean verify(String token, String remoteIp);
}