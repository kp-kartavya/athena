package com.interview.service.impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.interview.model.ApiRateLimit;
import com.interview.repo.ApiRateLimitRepository;
import com.interview.service.ApiRateLimitService;

import lombok.RequiredArgsConstructor;

/**
 * Provides database-backed API rate limiting.
 */
@Service
@RequiredArgsConstructor
public class ApiRateLimitServiceImpl implements ApiRateLimitService {

	private static final int WINDOW_SECONDS = 60;

	private final ApiRateLimitRepository apiRateLimitRepository;

	@Override
	@Transactional
	public boolean isAllowed(String clientKey, int maxRequests) {
		LocalDateTime now = LocalDateTime.now();

		apiRateLimitRepository.acquireLock(clientKey);

		ApiRateLimit rateLimit = apiRateLimitRepository.findById(clientKey)
				.orElseGet(() -> createRateLimit(clientKey, now));

		if (rateLimit.getWindowStart().plusSeconds(WINDOW_SECONDS).isBefore(now)) {
			rateLimit.setWindowStart(now);
			rateLimit.setRequestCount(1);
			apiRateLimitRepository.save(rateLimit);
			return true;
		}

		if (rateLimit.getRequestCount() >= maxRequests) {
			return false;
		}

		rateLimit.setRequestCount(rateLimit.getRequestCount() + 1);
		apiRateLimitRepository.save(rateLimit);

		return true;
	}

	private ApiRateLimit createRateLimit(String clientKey, LocalDateTime now) {
		ApiRateLimit rateLimit = new ApiRateLimit();
		rateLimit.setClientKey(clientKey);
		rateLimit.setWindowStart(now);
		rateLimit.setRequestCount(1);
		return apiRateLimitRepository.save(rateLimit);
	}
}