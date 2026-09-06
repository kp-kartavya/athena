package com.interview.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.interview.model.EmailVerification;

/**
 * Provides persistence operations for pending email verification requests.
 */
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {

	Optional<EmailVerification> findTopByEmailIgnoreCaseOrderByCreatedAtDesc(String email);

	void deleteByEmailIgnoreCase(String email);
}