package com.interview.service.impl;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.interview.dto.TurnstileResponse;
import com.interview.service.TurnstileService;

import lombok.extern.slf4j.Slf4j;

/**
 * Performs server-side verification of Cloudflare Turnstile tokens.
 *
 * The Turnstile secret is kept outside the application source and supplied
 * through environment-based configuration.
 */
@Slf4j
@Service
public class TurnstileServiceImpl implements TurnstileService {

	private final RestClient restClient;
	private final String secret;

	public TurnstileServiceImpl(RestClient.Builder restClientBuilder,
			@Value("${turnstile.verify-url}") String verifyUrl, @Value("${turnstile.secret}") String secret) {

		this.restClient = restClientBuilder.baseUrl(verifyUrl).build();

		this.secret = secret;
	}

	@Override
	public boolean verify(String token, String remoteIp) {

		if (token == null || token.isBlank() || token.length() > 2048) {
			return false;
		}

		try {
			TurnstileResponse response = restClient.post().contentType(MediaType.APPLICATION_JSON)
					.body(Map.of("secret", secret, "response", token, "remoteip", remoteIp == null ? "" : remoteIp))
					.retrieve().body(TurnstileResponse.class);

			if (response == null) {
				log.warn("Turnstile verification returned no response.");
				return false;
			}

			if (!response.isSuccess()) {
				log.warn("Turnstile verification failed: {}", response.getErrorCodes());
				return false;
			}

			return true;

		} catch (Exception e) {
			log.error("Turnstile verification failed.", e);
			return false;
		}
	}
}