package com.interview.util;

import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;

/**
 * Provides common OAuth2 user information used across authentication flows.
 *
 * Resolves the OAuth provider and provider-specific user ID so that application
 * code consistently identifies users by provider and OAuth ID.
 */
public final class OAuth2UserUtil {

	private OAuth2UserUtil() {
	}

	public static String getProvider(OAuth2AuthenticationToken oauthToken) {
		return oauthToken.getAuthorizedClientRegistrationId();
	}

	public static String getOauthId(OAuth2AuthenticationToken oauthToken) {
		OAuth2User oauthUser = oauthToken.getPrincipal();
		String provider = getProvider(oauthToken);

		if ("google".equals(provider)) {
			String oauthId = oauthUser.getAttribute("sub");
			if (oauthId == null || oauthId.isBlank()) {
				throw new IllegalArgumentException("Google user ID not found");
			}
			return oauthId;
		}
		if ("github".equals(provider)) {
			Object githubId = oauthUser.getAttribute("id");
			if (githubId == null) {
				throw new IllegalArgumentException("GitHub user ID not found");
			}
			return githubId.toString();
		}

		throw new IllegalArgumentException("Unsupported OAuth provider: " + provider);
	}
}