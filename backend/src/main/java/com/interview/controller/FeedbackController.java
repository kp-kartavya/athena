package com.interview.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interview.dto.FeedbackRequest;
import com.interview.service.FeedbackService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Handles Athena feedback submissions.
 */
@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

	private final FeedbackService feedbackService;

	@PostMapping
	public ResponseEntity<Map<String, String>> submitFeedback(@Valid @RequestBody FeedbackRequest request,
			Authentication authentication) {
		feedbackService.submitFeedback(request, authentication);
		return ResponseEntity.ok(Map.of("message", "Thank you for your feedback!"));
	}
}