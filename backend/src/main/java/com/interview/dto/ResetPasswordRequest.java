package com.interview.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Represents a request to reset a local account password.
 */
@Data
public class ResetPasswordRequest {

	@NotBlank
	@Email
	private String email;

	@NotBlank
	private String code;

	@NotBlank
	@Size(min = 8, max = 72)
	private String newPassword;
}