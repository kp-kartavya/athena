package com.interview.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GuestAskRequest {

	@NotBlank(message = "Question is required.")
	@Size(max = 2000, message = "Question is too long.")
	private String question;
}