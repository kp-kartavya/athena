package com.interview.security;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.interview.model.User;
import com.interview.repo.UserRepository;
import com.interview.util.OAuth2UserUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Handles successful OAuth2 authentication.
 *
 * Creates or updates the application user using the OAuth provider and
 * provider-specific OAuth ID, and retrieves the GitHub email when required.
 */
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

	private final UserRepository userRepository;
	private final OAuth2AuthorizedClientService authorizedClientService;
	private final RestClient restClient = RestClient.builder().baseUrl("https://api.github.com").build();

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			org.springframework.security.core.Authentication authentication) throws IOException, ServletException {

		OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
		OAuth2User oauthUser = oauthToken.getPrincipal();

		String provider = OAuth2UserUtil.getProvider(oauthToken);
		String oauthId = OAuth2UserUtil.getOauthId(oauthToken);

		Map<String, Object> attributes = oauthUser.getAttributes();

		String email;
		String name;
		String profileImage;

		if ("google".equals(provider)) {
			email = (String) attributes.get("email");
			name = (String) attributes.get("name");
			profileImage = (String) attributes.get("picture");
		} else if ("github".equals(provider)) {
			email = getGithubEmail(oauthToken, oauthUser);
			name = (String) attributes.get("name");
			profileImage = (String) attributes.get("avatar_url");
			if (name == null || name.isBlank()) {
				name = (String) attributes.get("login");
			}
		} else {
			throw new IllegalArgumentException("Unsupported OAuth provider: " + provider);
		}

		LocalDateTime now = LocalDateTime.now();

		User user = userRepository.findByOauthProviderAndOauthId(provider, oauthId).orElseGet(User::new);

		if (user.getId() == null) {
			user.setCreatedAt(now);
		}

		user.setName(name);
		user.setEmail(email);
		user.setOauthProvider(provider);
		user.setOauthId(oauthId);
		user.setProfileImage(profileImage);
		user.setLastLoginAt(now);
		user.setEmailVerified(true);
		
		userRepository.save(user);
		response.sendRedirect("/");
	}

	private String getGithubEmail(OAuth2AuthenticationToken oauthToken, OAuth2User oauthUser) {
		OAuth2AuthorizedClient authorizedClient = authorizedClientService
				.loadAuthorizedClient(oauthToken.getAuthorizedClientRegistrationId(), oauthUser.getName());

		if (authorizedClient == null || authorizedClient.getAccessToken() == null) {
			throw new IllegalStateException("GitHub access token not available");
		}

		String accessToken = authorizedClient.getAccessToken().getTokenValue();
		List<Map<String, Object>> emails = restClient.get().uri("/user/emails").headers(headers -> {
			headers.setBearerAuth(accessToken);
			headers.set("Accept", "application/vnd.github+json");
			headers.set("X-GitHub-Api-Version", "2022-11-28");
		}).retrieve().body(new ParameterizedTypeReference<List<Map<String, Object>>>() {
		});

		if (emails == null || emails.isEmpty()) {
			throw new IllegalStateException("No email address found for GitHub account");
		}

		for (Map<String, Object> githubEmail : emails) {
			Boolean primary = (Boolean) githubEmail.get("primary");
			Boolean verified = (Boolean) githubEmail.get("verified");

			if (Boolean.TRUE.equals(primary) && Boolean.TRUE.equals(verified)) {
				return (String) githubEmail.get("email");
			}
		}

		for (Map<String, Object> githubEmail : emails) {
			Boolean verified = (Boolean) githubEmail.get("verified");

			if (Boolean.TRUE.equals(verified)) {
				return (String) githubEmail.get("email");
			}
		}

		throw new IllegalStateException("No verified email found for GitHub account");
	}
}