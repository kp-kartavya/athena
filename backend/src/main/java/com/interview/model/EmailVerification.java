package com.interview.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * Represents a pending local account email verification request.
 *
 * Stores the registration details and a hashed verification code until the
 * email address is successfully verified.
 */
@Data
@Entity
@Table(name = "email_verifications")
public class EmailVerification {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String email;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false)
	private String passwordHash;

	@Column(nullable = false)
	private String verificationCodeHash;

	@Column(nullable = false)
	private LocalDateTime expiresAt;

	@Column(nullable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private int verificationAttempts = 0;

	@Column(nullable = false)
	private int resendCount = 0;

	private LocalDateTime lastResendAt;
}