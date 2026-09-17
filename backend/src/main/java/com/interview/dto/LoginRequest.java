package com.interview.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request used to authenticate a local Athena account.
 */
@Data
public class LoginRequest {

	@NotBlank(message = "Email address is required.")
	@Email(message = "Enter a valid email address.")
	private String email;

	@NotBlank(message = "Password is required.")
	private String password;

	@NotBlank(message = "Please complete the security check.")
	private String turnstileToken;
}