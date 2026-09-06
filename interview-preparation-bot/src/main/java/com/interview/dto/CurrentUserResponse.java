package com.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents the authenticated user's basic profile information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CurrentUserResponse {

	private boolean authenticated;
	private String name;
	private String initial;
}