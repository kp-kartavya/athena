package com.interview.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request used to create a local Athena account.
 */
@Data
public class RegisterRequest {

	@NotBlank
	@Size(min = 2, max = 100)
	private String name;

	@NotBlank
	@Email
	@Size(max = 255)
	private String email;

	@NotBlank
	@Size(min = 8, max = 128)
	private String password;

	@NotBlank
	private String turnstileToken;
}