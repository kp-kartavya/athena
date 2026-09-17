package com.interview.service.impl;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.interview.dto.FeedbackRequest;
import com.interview.service.EmailService;
import com.interview.service.FeedbackService;

import lombok.RequiredArgsConstructor;

/**
 * Processes Athena feedback and sends it through the existing email system.
 */
@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

	private final EmailService emailService;

	@Override
	public void submitFeedback(FeedbackRequest request, Authentication authentication) {
		boolean authenticated = authentication != null && authentication.isAuthenticated()
				&& !"anonymousUser".equals(authentication.getPrincipal());

		String userName = request.getName();
		String userEmail = request.getEmail();

		if (authenticated) {
			Object principal = authentication.getPrincipal();

			if (principal instanceof com.interview.model.User user) {
				if (!StringUtils.hasText(userName)) {
					userName = user.getName();
				}

				if (!StringUtils.hasText(userEmail)) {
					userEmail = user.getEmail();
				}
			} else {
				if (!StringUtils.hasText(userName)) {
					userName = authentication.getName();
				}

				if (!StringUtils.hasText(userEmail)) {
					userEmail = authentication.getName();
				}
			}
		}

		emailService.sendFeedbackEmail(request.getRating(), request.getFeedback(), request.getImprovement(), userName,
				userEmail, authenticated);
	}
}