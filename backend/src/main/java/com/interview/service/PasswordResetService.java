package com.interview.service;

import com.interview.dto.ForgotPasswordRequest;
import com.interview.dto.ResetPasswordRequest;

/**
 * Handles local account password reset operations.
 */
public interface PasswordResetService {

	void requestReset(ForgotPasswordRequest request);

	void resendCode(String email, String turnstileToken);

	void resetPassword(ResetPasswordRequest request);
}