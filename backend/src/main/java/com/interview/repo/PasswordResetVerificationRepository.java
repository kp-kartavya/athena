package com.interview.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.interview.model.PasswordResetVerification;

/**
 * Provides persistence operations for password reset verification requests.
 */
public interface PasswordResetVerificationRepository extends JpaRepository<PasswordResetVerification, Long> {

	Optional<PasswordResetVerification> findTopByEmailIgnoreCaseOrderByCreatedAtDesc(String email);

	void deleteByEmailIgnoreCase(String email);
}