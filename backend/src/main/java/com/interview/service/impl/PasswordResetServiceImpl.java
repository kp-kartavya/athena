package com.interview.service.impl;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.interview.dto.ForgotPasswordRequest;
import com.interview.dto.ResetPasswordRequest;
import com.interview.model.PasswordResetVerification;
import com.interview.model.User;
import com.interview.repo.PasswordResetVerificationRepository;
import com.interview.repo.UserRepository;
import com.interview.service.EmailService;
import com.interview.service.PasswordResetService;
import com.interview.service.TurnstileService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

/**
 * Handles password reset requests and password updates for local accounts.
 *
 * Reset codes are six-digit values stored only as hashes. Codes expire after
 * ten minutes and verification attempts are limited to reduce brute-force
 * attacks.
 */
@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

	private static final String LOCAL_PROVIDER = "local";

	private static final int CODE_MIN = 100000;

	private static final int CODE_RANGE = 900000;

	private static final int CODE_EXPIRY_MINUTES = 10;

	private static final int MAX_VERIFICATION_ATTEMPTS = 5;

	private static final int MAX_RESENDS = 5;

	private static final int RESEND_COOLDOWN_SECONDS = 60;

	private static final int RESEND_WINDOW_MINUTES = 30;

	private final PasswordResetVerificationRepository passwordResetVerificationRepository;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final EmailService emailService;
	private final TurnstileService turnstileService;
	private final HttpServletRequest httpServletRequest;
	private final SecureRandom secureRandom = new SecureRandom();

	@Override
	@Transactional
	public void requestReset(ForgotPasswordRequest request) {
		String email = normalizeEmail(request.getEmail());
		String remoteIp = getClientIp();

		if (!turnstileService.verify(request.getTurnstileToken(), remoteIp)) {
			throw new IllegalArgumentException("Turnstile verification failed.");
		}

		User user = userRepository.findByEmailIgnoreCaseAndOauthProvider(email, LOCAL_PROVIDER).orElse(null);

		/*
		 * Do not reveal whether an email belongs to a local Athena account.
		 */
		if (user == null) {
			return;
		}

		passwordResetVerificationRepository.deleteByEmailIgnoreCase(email);

		String code = generateCode();

		LocalDateTime now = LocalDateTime.now();

		PasswordResetVerification verification = new PasswordResetVerification();
		verification.setEmail(email);
		verification.setVerificationCodeHash(passwordEncoder.encode(code));
		verification.setCreatedAt(now);
		verification.setExpiresAt(now.plusMinutes(CODE_EXPIRY_MINUTES));
		verification.setVerificationAttempts(0);
		verification.setResendCount(0);
		verification.setLastResendAt(null);

		passwordResetVerificationRepository.save(verification);
		emailService.sendPasswordResetCode(email, user.getName(), code);
	}

	@Override
	@Transactional(noRollbackFor = IllegalArgumentException.class)
	public void resetPassword(ResetPasswordRequest request) {
		String email = normalizeEmail(request.getEmail());

		PasswordResetVerification verification = passwordResetVerificationRepository
				.findTopByEmailIgnoreCaseOrderByCreatedAtDesc(email)
				.orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset code."));

		LocalDateTime now = LocalDateTime.now();

		if (verification.getExpiresAt().isBefore(now)) {
			passwordResetVerificationRepository.delete(verification);
			throw new IllegalArgumentException("Reset code has expired.");
		}

		if (verification.getVerificationAttempts() >= MAX_VERIFICATION_ATTEMPTS) {
			throw new IllegalArgumentException("Too many incorrect attempts. Request a new code.");
		}

		String code = request.getCode();

		if (code == null || !code.trim().matches("\\d{6}")) {
			incrementAttempts(verification);
			throw new IllegalArgumentException("Invalid reset code.");
		}

		boolean valid = passwordEncoder.matches(code.trim(), verification.getVerificationCodeHash());

		if (!valid) {
			incrementAttempts(verification);
			throw new IllegalArgumentException("Invalid reset code.");
		}

		User user = userRepository.findByEmailIgnoreCaseAndOauthProvider(email, LOCAL_PROVIDER)
				.orElseThrow(() -> new IllegalArgumentException("Invalid reset request."));

		user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));

		userRepository.save(user);
		passwordResetVerificationRepository.delete(verification);
	}

	private void incrementAttempts(PasswordResetVerification verification) {
		verification.setVerificationAttempts(verification.getVerificationAttempts() + 1);
		passwordResetVerificationRepository.save(verification);
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

	@Override
	@Transactional
	public void resendCode(String email, String turnstileToken) {
		email = normalizeEmail(email);

		String remoteIp = getClientIp();

		if (!turnstileService.verify(turnstileToken, remoteIp)) {
			throw new IllegalArgumentException("Turnstile verification failed.");
		}

		User user = userRepository.findByEmailIgnoreCaseAndOauthProvider(email, LOCAL_PROVIDER).orElse(null);

		if (user == null) {
			return;
		}

		PasswordResetVerification verification = passwordResetVerificationRepository
				.findTopByEmailIgnoreCaseOrderByCreatedAtDesc(email)
				.orElseThrow(() -> new IllegalArgumentException("Request a password reset first."));

		LocalDateTime now = LocalDateTime.now();
		LocalDateTime windowStart = now.minusMinutes(RESEND_WINDOW_MINUTES);

		if (verification.getCreatedAt().isBefore(windowStart)) {
			verification.setResendCount(0);
		}

		if (verification.getLastResendAt() != null
				&& verification.getLastResendAt().plusSeconds(RESEND_COOLDOWN_SECONDS).isAfter(now)) {
			throw new IllegalArgumentException("Please wait before requesting another code.");
		}

		if (verification.getResendCount() >= MAX_RESENDS) {
			throw new IllegalArgumentException("Too many resend attempts. Please request a new reset.");
		}

		String code = generateCode();

		verification.setVerificationCodeHash(passwordEncoder.encode(code));
		verification.setCreatedAt(now);
		verification.setExpiresAt(now.plusMinutes(CODE_EXPIRY_MINUTES));
		verification.setVerificationAttempts(0);
		verification.setResendCount(verification.getResendCount() + 1);
		verification.setLastResendAt(now);

		passwordResetVerificationRepository.save(verification);
		emailService.sendPasswordResetCode(email, user.getName(), code);
	}
}