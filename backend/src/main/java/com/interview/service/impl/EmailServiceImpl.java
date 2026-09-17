package com.interview.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.interview.service.EmailService;

import lombok.RequiredArgsConstructor;

/**
 * Sends email verification and password reset messages for Athena local
 * accounts.
 */
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

	private final JavaMailSender mailSender;

	@Value("${athena.mail.from}")
	private String from;
	@Value("${athena.feedback.to:${MAIL_USERNAME}}")
	private String feedbackTo;

	@Override
	public void sendVerificationCode(String email, String name, String code) {
		SimpleMailMessage message = new SimpleMailMessage();
		message.setFrom(from);
		message.setTo(email);
		message.setSubject("Your Athena verification code");

		message.setText("""
				Hi %s,

				Your Athena verification code is:

				%s

				This code expires in 10 minutes.

				If you did not create an Athena account, you can ignore this email.

				Regards,

				Athena
				""".formatted(name, code));

		mailSender.send(message);
	}

	@Override
	public void sendPasswordResetCode(String email, String name, String code) {
		SimpleMailMessage message = new SimpleMailMessage();
		message.setFrom(from);
		message.setTo(email);
		message.setSubject("Your Athena password reset code");

		message.setText("""
				Hi %s,

				Your Athena password reset code is:

				%s

				This code expires in 10 minutes.

				If you did not request a password reset, you can ignore this email.

				Regards,

				Athena
				""".formatted(name, code));

		mailSender.send(message);
	}

	@Override
	public void sendFeedbackEmail(int rating, String feedback, String improvement, String userName, String userEmail,
			boolean authenticated) {

		SimpleMailMessage message = new SimpleMailMessage();

		message.setFrom(from);
		message.setTo(feedbackTo);
		message.setSubject("New Athena Feedback — " + rating + "/5");

		String submittedBy = authenticated ? "Authenticated user" : "Guest user";

		String name = userName == null || userName.isBlank() ? "Not provided" : userName;

		String email = userEmail == null || userEmail.isBlank() ? "Not provided" : userEmail;

		String primaryFeedback = feedback == null || feedback.isBlank() ? "Not provided" : feedback;

		String improvementFeedback = improvement == null || improvement.isBlank() ? "Not provided" : improvement;

		message.setText("""
				New feedback received for Athena

				Rating: %d/5

				Account type: %s

				User name: %s

				User email: %s

				What did you think of Athena?
				--------------------------------
				%s

				What could be improved?
				--------------------------------
				%s

				Regards,

				Athena Feedback System
				""".formatted(rating, submittedBy, name, email, primaryFeedback, improvementFeedback));

		mailSender.send(message);
	}
}