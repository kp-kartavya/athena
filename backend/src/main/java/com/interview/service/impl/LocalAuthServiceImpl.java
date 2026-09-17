package com.interview.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.interview.dto.CheckEmailResponse;
import com.interview.dto.LoginRequest;
import com.interview.dto.RegisterRequest;
import com.interview.model.User;
import com.interview.repo.UserRepository;
import com.interview.service.EmailVerificationService;
import com.interview.service.LocalAuthService;
import com.interview.service.TurnstileService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Handles local email/password authentication and account registration.
 *
 * Registration is protected by Cloudflare Turnstile and proceeds through email
 * verification before the local account is created.
 *
 * Local login is protected by Turnstile and uses Spring Security authentication
 * with a session-backed security context.
 */
@Service
@RequiredArgsConstructor
public class LocalAuthServiceImpl implements LocalAuthService {

	private static final String LOCAL_PROVIDER = "local";

	private final UserRepository userRepository;
	private final EmailVerificationService emailVerificationService;
	private final TurnstileService turnstileService;
	private final AuthenticationManager authenticationManager;
	private final SecurityContextRepository securityContextRepository;
	private final HttpServletRequest httpServletRequest;

	@Override
	public CheckEmailResponse checkEmail(String email) {
		String normalizedEmail = normalizeEmail(email);

		List<User> users = userRepository.findAllByEmailIgnoreCase(normalizedEmail);

		List<String> providers = users.stream().map(User::getOauthProvider)
				.filter(provider -> provider != null && !provider.isBlank()).distinct().toList();

		return new CheckEmailResponse(!users.isEmpty(), providers);
	}

	@Override
	@Transactional
	public void register(RegisterRequest request) {

		String remoteIp = getClientIp();

		if (!turnstileService.verify(request.getTurnstileToken(), remoteIp)) {

			throw new IllegalArgumentException("Turnstile verification failed.");
		}

		emailVerificationService.createVerification(request);
	}

	@Override
	@Transactional
	public void login(LoginRequest request, HttpServletResponse httpServletResponse) {

		String email = normalizeEmail(request.getEmail());

		String remoteIp = getClientIp();

		if (!turnstileService.verify(request.getTurnstileToken(), remoteIp)) {

			throw new IllegalArgumentException("Turnstile verification failed.");
		}

		Authentication authentication;

		try {

			authentication = authenticationManager
					.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(email, request.getPassword()));

		} catch (BadCredentialsException exception) {

			throw new IllegalArgumentException("Wrong email or password.");
		}

		SecurityContext context = SecurityContextHolder.createEmptyContext();

		context.setAuthentication(authentication);

		SecurityContextHolder.setContext(context);

		securityContextRepository.saveContext(context, httpServletRequest, httpServletResponse);

		User user = userRepository.findByEmailIgnoreCaseAndOauthProvider(email, LOCAL_PROVIDER)
				.orElseThrow(() -> new IllegalArgumentException("Wrong email or password."));

		user.setLastLoginAt(LocalDateTime.now());

		userRepository.save(user);
	}

	private String normalizeEmail(String email) {

		if (email == null || email.isBlank()) {
			throw new IllegalArgumentException("Email address is required.");
		}

		return email.trim().toLowerCase();
	}

	private String getClientIp() {

		String forwardedFor = httpServletRequest.getHeader("X-Forwarded-For");

		if (forwardedFor != null && !forwardedFor.isBlank()) {
			return forwardedFor.split(",")[0].trim();
		}

		return httpServletRequest.getRemoteAddr();
	}
}