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
 * Represents a temporary password reset verification request.
 *
 * The verification code is stored only as a password hash and expires after a
 * short period to reduce the risk of unauthorized password resets.
 */
@Data
@Entity
@Table(name = "password_reset_verifications")
public class PasswordResetVerification {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String email;

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