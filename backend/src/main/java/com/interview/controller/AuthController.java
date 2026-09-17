package com.interview.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interview.dto.CheckEmailResponse;
import com.interview.dto.ForgotPasswordRequest;
import com.interview.dto.LoginRequest;
import com.interview.dto.RegisterRequest;
import com.interview.dto.ResetPasswordRequest;
import com.interview.service.CurrentUserService;
import com.interview.service.EmailVerificationService;
import com.interview.service.LocalAuthService;
import com.interview.service.PasswordResetService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Exposes authentication and account-management endpoints.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final LocalAuthService localAuthService;
	private final EmailVerificationService emailVerificationService;
	private final PasswordResetService passwordResetService;
	private final CurrentUserService currentUserService;

	@GetMapping("/me")
	public Object getCurrentUser(Authentication authentication) {
		return currentUserService.getCurrentUser(authentication);
	}

	@PostMapping("/check-email")
	public CheckEmailResponse checkEmail(@RequestBody Map<String, String> request) {
		return localAuthService.checkEmail(request.get("email"));
	}

	@PostMapping("/register")
	public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
		localAuthService.register(request);
		return ResponseEntity.ok().build();
	}

	@PostMapping("/verify-email")
	public ResponseEntity<Void> verifyEmail(@RequestBody Map<String, String> request) {
		emailVerificationService.verifyEmail(request.get("email"), request.get("code"));
		return ResponseEntity.ok().build();
	}

	@PostMapping("/resend-code")
	public ResponseEntity<Void> resendCode(@RequestBody Map<String, String> request) {
		emailVerificationService.resendCode(request.get("email"), request.get("turnstileToken"));
		return ResponseEntity.ok().build();
	}

	@PostMapping("/login")
	public ResponseEntity<Void> login(@Valid @RequestBody LoginRequest request,
			HttpServletResponse httpServletResponse) {
		localAuthService.login(request, httpServletResponse);
		return ResponseEntity.ok().build();
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
		passwordResetService.requestReset(request);
		return ResponseEntity.ok().build();
	}

	@PostMapping("/reset-password")
	public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
		passwordResetService.resetPassword(request);
		return ResponseEntity.ok().build();
	}

	@PostMapping("/resend-password-reset-code")
	public ResponseEntity<Void> resendPasswordResetCode(@RequestBody Map<String, String> request) {
		passwordResetService.resendCode(request.get("email"), request.get("turnstileToken"));
		return ResponseEntity.ok().build();
	}
}