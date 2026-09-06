package com.interview.service.impl;

import java.util.Optional;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;

import com.interview.dto.CurrentUserResponse;
import com.interview.model.User;
import com.interview.repo.UserRepository;
import com.interview.service.CurrentUserService;
import com.interview.util.OAuth2UserUtil;

import lombok.RequiredArgsConstructor;

/**
 * Resolves the authenticated application user from Spring Security details.
 *
 * Supports both OAuth2 authentication and local email/password authentication.
 */
@Service
@RequiredArgsConstructor
public class CurrentUserServiceImpl implements CurrentUserService {

	private static final String LOCAL_PROVIDER = "local";

	private final UserRepository userRepository;

	@Override
	public CurrentUserResponse getCurrentUser(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return new CurrentUserResponse(false, null, null);
		}

		User user = resolveUser(authentication);

		if (user == null) {
			return new CurrentUserResponse(false, null, null);
		}

		String name = user.getName();

		return new CurrentUserResponse(true, name, getInitial(name));
	}

	private User resolveUser(Authentication authentication) {
		if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
			String provider = OAuth2UserUtil.getProvider(oauthToken);
			String oauthId = OAuth2UserUtil.getOauthId(oauthToken);

			return userRepository.findByOauthProviderAndOauthId(provider, oauthId).orElse(null);
		}

		if (authentication instanceof UsernamePasswordAuthenticationToken) {
			String email = authentication.getName();
			Optional<User> localUser = userRepository.findByEmailIgnoreCaseAndOauthProvider(email, LOCAL_PROVIDER);
			return localUser.orElse(null);
		}

		return null;
	}

	private String getInitial(String name) {
		if (name == null || name.isBlank()) {
			return "?";
		}

		String[] nameParts = name.trim().split("\\s+");

		if (nameParts.length == 1) {
			return nameParts[0].substring(0, 1).toUpperCase();
		}

		return (nameParts[0].substring(0, 1) + nameParts[nameParts.length - 1].substring(0, 1)).toUpperCase();
	}
}