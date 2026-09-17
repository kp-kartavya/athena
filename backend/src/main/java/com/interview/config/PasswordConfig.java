package com.interview.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.interview.util.Constants;

/**
 * Provides secure password hashing for local Athena accounts.
 */
@Configuration
public class PasswordConfig {

	@Bean
	PasswordEncoder passwordEncoder() {
		return new Argon2PasswordEncoder(Constants.SALT, Constants.HASH_LENGTH, Constants.PARALLELISM, Constants.MEMORY,
				Constants.ITERATIONS);
	}
}