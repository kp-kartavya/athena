package com.interview.security;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.interview.service.ApiRateLimitService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Applies API rate limiting to authentication-related endpoints.
 */
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

	private static final int LOGIN_LIMIT = 10;
	private static final int CHECK_EMAIL_LIMIT = 20;
	private static final int REGISTER_LIMIT = 5;
	private static final int VERIFY_EMAIL_LIMIT = 10;
	private static final int RESEND_CODE_LIMIT = 5;
	private static final int FORGOT_PASSWORD_LIMIT = 5;
	private static final int RESET_PASSWORD_LIMIT = 10;
	private static final int RESEND_PASSWORD_RESET_LIMIT = 5;

	private final ApiRateLimitService apiRateLimitService;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		String endpoint = request.getRequestURI();
		int limit = getLimit(endpoint);

		if (limit == 0) {
			filterChain.doFilter(request, response);
			return;
		}

		String clientIp = getClientIp(request);
		String clientKey = clientIp + ":" + endpoint;

		if (!apiRateLimitService.isAllowed(clientKey, limit)) {
			response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
			response.setContentType("application/json");
			response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
			return;
		}

		filterChain.doFilter(request, response);
	}

	private int getLimit(String endpoint) {
		return switch (endpoint) {
		case "/api/auth/login" -> LOGIN_LIMIT;
		case "/api/auth/check-email" -> CHECK_EMAIL_LIMIT;
		case "/api/auth/register" -> REGISTER_LIMIT;
		case "/api/auth/verify-email" -> VERIFY_EMAIL_LIMIT;
		case "/api/auth/resend-code" -> RESEND_CODE_LIMIT;
		case "/api/auth/forgot-password" -> FORGOT_PASSWORD_LIMIT;
		case "/api/auth/reset-password" -> RESET_PASSWORD_LIMIT;
		case "/api/auth/resend-password-reset-code" -> RESEND_PASSWORD_RESET_LIMIT;
		default -> 0;
		};
	}

	private String getClientIp(HttpServletRequest request) {
		String forwardedFor = request.getHeader("X-Forwarded-For");

		if (forwardedFor != null && !forwardedFor.isBlank()) {
			return forwardedFor.split(",")[0].trim();
		}

		return request.getRemoteAddr();
	}
}