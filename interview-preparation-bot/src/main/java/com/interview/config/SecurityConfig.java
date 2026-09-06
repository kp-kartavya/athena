package com.interview.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import com.interview.security.OAuth2LoginSuccessHandler;
import com.interview.security.RateLimitFilter;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Configures application security, OAuth2 login, logout and API protection.
 */
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

	private final OAuth2LoginSuccessHandler oauth2LoginSuccessHandler;
	private final RateLimitFilter rateLimitFilter;

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
				.csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/oauth2/**", "/login/**", "/api/auth/me", "/api/auth/csrf",
								"/api/auth/check-email", "/api/auth/register", "/api/auth/verify-email",
								"/api/auth/resend-code", "/api/auth/login", "/api/auth/forgot-password",
								"/api/auth/reset-password", "/api/auth/resend-password-reset-code", "/api/auth/logout",
								"/actuator/health/**", "/livez", "/readyz", "/v3/api-docs/**", "/swagger-ui.html")
						.permitAll().anyRequest().authenticated())
				.exceptionHandling(
						exception -> exception.authenticationEntryPoint((request, response, authException) -> {
							if (request.getRequestURI().startsWith("/api/")) {
								response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
								response.setContentType("application/json");
								response.getWriter().write("{\"error\":\"Authentication required.\"}");
							}
						}).accessDeniedHandler((request, response, accessDeniedException) -> {
							if (request.getRequestURI().startsWith("/api/")) {
								response.setStatus(HttpServletResponse.SC_FORBIDDEN);
								response.setContentType("application/json");
								response.getWriter().write("{\"error\":\"Access denied.\"}");
							}
						}))
				.sessionManagement(
						session -> session.sessionFixation(sessionFixation -> sessionFixation.changeSessionId()))
				.addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
				.oauth2Login(oauth -> oauth.successHandler(oauth2LoginSuccessHandler)).logout(logout -> logout
						.logoutUrl("/api/auth/logout").logoutSuccessHandler((request, response, authentication) -> {
							response.setStatus(HttpServletResponse.SC_NO_CONTENT);
						}).invalidateHttpSession(true).clearAuthentication(true)
						.deleteCookies("JSESSIONID", "SESSION"));

		return http.build();
	}
}