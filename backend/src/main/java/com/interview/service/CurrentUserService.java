package com.interview.service;

import org.springframework.security.core.Authentication;

import com.interview.dto.CurrentUserResponse;

/**
 * Resolves the currently authenticated Athena user.
 */
public interface CurrentUserService {

	/**
	 * Resolves the authenticated application user from Spring Security
	 * authentication details.
	 *
	 * @param authentication current Spring Security authentication
	 * @return current user profile information
	 */
	CurrentUserResponse getCurrentUser(Authentication authentication);
}