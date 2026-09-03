package com.interview.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import com.interview.security.OAuth2LoginSuccessHandler;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
	private final OAuth2LoginSuccessHandler oauth2LoginSuccessHandler;

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		http.authorizeHttpRequests(auth -> auth.requestMatchers("/oauth2/**", "/login/**", "/actuator/health/**",
				"/livez", "/readyz", "/v3/api-docs/**", "/swagger-ui.html").permitAll().anyRequest().authenticated())
				.oauth2Login(oauth -> oauth.successHandler(oauth2LoginSuccessHandler));

		return http.build();
	}
}