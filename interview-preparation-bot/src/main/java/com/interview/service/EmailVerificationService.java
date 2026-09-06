package com.interview.service;

import com.interview.dto.RegisterRequest;

/**
 * Manages email verification requests for local Athena accounts.
 */
public interface EmailVerificationService {

	void createVerification(RegisterRequest request);

	void verifyEmail(String email, String code);

	void resendCode(String email, String turnstileToken);
}