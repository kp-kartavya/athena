package com.interview.service.impl;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.interview.dto.RegisterRequest;
import com.interview.model.EmailVerification;
import com.interview.model.User;
import com.interview.repo.EmailVerificationRepository;
import com.interview.repo.UserRepository;
import com.interview.service.EmailService;
import com.interview.service.EmailVerificationService;
import com.interview.service.TurnstileService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

/**
 * Manages pending email verification requests for local Athena accounts.
 *
 * Verification codes are six-digit values and are stored only as hashes.
 * Verification attempts and resend activity are limited to reduce brute-force
 * and email abuse.
 *
 * Resending a verification code requires successful Cloudflare Turnstile
 * verification.
 */
@Service
@RequiredArgsConstructor
public class EmailVerificationServiceImpl implements EmailVerificationService {

	private static final int CODE_MIN = 100000;
	private static final int CODE_RANGE = 900000;

	private static final int CODE_EXPIRY_MINUTES = 10;

	private static final int MAX_VERIFICATION_ATTEMPTS = 5;

	private static final int RESEND_COOLDOWN_SECONDS = 60;

	private static final int MAX_RESENDS = 5;

	private static final int RESEND_WINDOW_MINUTES = 30;

	private final EmailVerificationRepository emailVerificationRepository;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final EmailService emailService;
	private final TurnstileService turnstileService;
	private final HttpServletRequest httpServletRequest;

	private final SecureRandom secureRandom = new SecureRandom();

	@Override
	@Transactional
	public void createVerification(RegisterRequest request) {
		String email = normalizeEmail(request.getEmail());

		if (!userRepository.findAllByEmailIgnoreCase(email).isEmpty()) {
			throw new IllegalArgumentException("An account already exists for this email.");
		}

		emailVerificationRepository.deleteByEmailIgnoreCase(email);

		String code = generateCode();

		LocalDateTime now = LocalDateTime.now();

		EmailVerification verification = new EmailVerification();

		verification.setEmail(email);
		verification.setName(request.getName().trim());
		verification.setPasswordHash(passwordEncoder.encode(request.getPassword()));
		verification.setVerificationCodeHash(passwordEncoder.encode(code));
		verification.setCreatedAt(now);
		verification.setExpiresAt(now.plusMinutes(CODE_EXPIRY_MINUTES));
		verification.setVerificationAttempts(0);
		verification.setResendCount(0);
		verification.setLastResendAt(null);

		emailVerificationRepository.save(verification);

		emailService.sendVerificationCode(email, verification.getName(), code);
	}

	@Override
	@Transactional(noRollbackFor = IllegalArgumentException.class)
	public void verifyEmail(String email, String code) {
		String normalizedEmail = normalizeEmail(email);

		EmailVerification verification = emailVerificationRepository
				.findTopByEmailIgnoreCaseOrderByCreatedAtDesc(normalizedEmail)
				.orElseThrow(() -> new IllegalArgumentException("No pending verification found."));

		LocalDateTime now = LocalDateTime.now();

		if (verification.getExpiresAt().isBefore(now)) {
			emailVerificationRepository.delete(verification);
			throw new IllegalArgumentException("Verification code has expired.");
		}

		if (verification.getVerificationAttempts() >= MAX_VERIFICATION_ATTEMPTS) {
			throw new IllegalArgumentException("Too many incorrect attempts. Request a new code.");
		}

		if (code == null || code.trim().length() != 6 || !code.trim().matches("\\d{6}")) {
			incrementVerificationAttempts(verification);
			throw new IllegalArgumentException("Invalid verification code.");
		}

		boolean valid = passwordEncoder.matches(code.trim(), verification.getVerificationCodeHash());

		if (!valid) {
			incrementVerificationAttempts(verification);
			throw new IllegalArgumentException("Invalid verification code.");
		}

		if (!userRepository.findAllByEmailIgnoreCase(normalizedEmail).isEmpty()) {
			emailVerificationRepository.delete(verification);
			throw new IllegalArgumentException("An account already exists for this email.");
		}

		User user = new User();
		user.setName(verification.getName());
		user.setEmail(normalizedEmail);
		user.setOauthProvider("local");
		user.setOauthId(null);
		user.setPasswordHash(verification.getPasswordHash());
		user.setEmailVerified(true);
		user.setCreatedAt(now);

		userRepository.save(user);
		emailVerificationRepository.delete(verification);
	}

	@Override
	@Transactional
	public void resendCode(String email, String turnstileToken) {
		String remoteIp = getClientIp();

		boolean turnstileValid = turnstileService.verify(turnstileToken, remoteIp);

		if (!turnstileValid) {
			throw new IllegalArgumentException("Turnstile verification failed.");
		}

		String normalizedEmail = normalizeEmail(email);

		EmailVerification verification = emailVerificationRepository
				.findTopByEmailIgnoreCaseOrderByCreatedAtDesc(normalizedEmail)
				.orElseThrow(() -> new IllegalArgumentException("No pending registration found."));

		LocalDateTime now = LocalDateTime.now();

		if (verification.getLastResendAt() != null) {
			long secondsSinceLastResend = Duration.between(verification.getLastResendAt(), now).getSeconds();

			if (secondsSinceLastResend < RESEND_COOLDOWN_SECONDS) {
				throw new IllegalArgumentException("Please wait before requesting another code.");
			}
		}

		if (verification.getLastResendAt() == null
				|| verification.getLastResendAt().isBefore(now.minusMinutes(RESEND_WINDOW_MINUTES))) {
			verification.setResendCount(0);
		}

		if (verification.getResendCount() >= MAX_RESENDS) {
			throw new IllegalArgumentException("Too many verification codes requested. Please try again later.");
		}

		if (!userRepository.findAllByEmailIgnoreCase(normalizedEmail).isEmpty()) {
			emailVerificationRepository.delete(verification);
			throw new IllegalArgumentException("An account already exists for this email.");
		}

		String code = generateCode();

		verification.setVerificationCodeHash(passwordEncoder.encode(code));
		verification.setCreatedAt(now);
		verification.setExpiresAt(now.plusMinutes(CODE_EXPIRY_MINUTES));
		verification.setVerificationAttempts(0);
		verification.setResendCount(verification.getResendCount() + 1);
		verification.setLastResendAt(now);

		emailVerificationRepository.save(verification);
		emailService.sendVerificationCode(normalizedEmail, verification.getName(), code);
	}

	private void incrementVerificationAttempts(EmailVerification verification) {
		verification.setVerificationAttempts(verification.getVerificationAttempts() + 1);
		emailVerificationRepository.save(verification);
	}

	private String generateCode() {
		return String.valueOf(CODE_MIN + secureRandom.nextInt(CODE_RANGE));
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