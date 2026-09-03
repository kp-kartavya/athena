package com.interview.security;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.interview.model.User;
import com.interview.repo.UserRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

	private final UserRepository userRepository;

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws java.io.IOException, ServletException {

		OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;

		OAuth2User oauthUser = oauthToken.getPrincipal();

		String provider = oauthToken.getAuthorizedClientRegistrationId();

		Map<String, Object> attributes = oauthUser.getAttributes();

		String oauthId = (String) attributes.get("sub");
		String email = (String) attributes.get("email");
		String name = (String) attributes.get("name");
		String profileImage = (String) attributes.get("picture");

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

		userRepository.save(user);

		response.sendRedirect("/");
	}
}