package com.interview.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Represents a request to start a local password reset.
 */
@Data
public class ForgotPasswordRequest {

	@NotBlank
	@Email
	private String email;

	@NotBlank
	private String turnstileToken;
}