package com.interview.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.interview.model.User;
import com.interview.repo.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Loads local Athena users for Spring Security authentication.
 *
 * Users are identified by their email address and must have a verified email
 * address before local authentication is allowed.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

	private static final String LOCAL_PROVIDER = "local";

	private final UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		String normalizedEmail = normalizeEmail(email);

		User user = userRepository.findByEmailIgnoreCaseAndOauthProvider(normalizedEmail, LOCAL_PROVIDER)
				.orElseThrow(() -> new UsernameNotFoundException("Invalid email or password."));

		if (!user.isEmailVerified()) {
			throw new UsernameNotFoundException("Please verify your email before signing in.");
		}

		if (user.getPasswordHash() == null) {
			throw new UsernameNotFoundException("Local authentication is not available for this account.");
		}

		return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
				.password(user.getPasswordHash()).authorities("USER").build();
	}

	private String normalizeEmail(String email) {
		if (email == null || email.isBlank()) {
			throw new UsernameNotFoundException("Invalid email or password.");
		}

		return email.trim().toLowerCase();
	}
}