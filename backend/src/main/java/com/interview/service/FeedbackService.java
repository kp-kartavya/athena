package com.interview.service;

import com.interview.dto.FeedbackRequest;

import org.springframework.security.core.Authentication;

/**
 * Handles Athena user feedback.
 */
public interface FeedbackService {

	void submitFeedback(FeedbackRequest request, Authentication authentication);
}