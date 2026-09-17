package com.interview.service;

/**
 * Sends application emails.
 */
public interface EmailService {

	void sendVerificationCode(String email, String name, String code);

	void sendPasswordResetCode(String email, String name, String code);

	void sendFeedbackEmail(int rating, String feedback, String improvement, String userName, String userEmail,
			boolean authenticated);
}