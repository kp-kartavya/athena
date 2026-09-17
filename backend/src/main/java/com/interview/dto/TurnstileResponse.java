package com.interview.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

/**
 * Represents the response returned by Cloudflare Turnstile Siteverify.
 */
@Data
public class TurnstileResponse {

	private boolean success;

	@JsonProperty("error-codes")
	private List<String> errorCodes;

	private String hostname;

	private String action;
}