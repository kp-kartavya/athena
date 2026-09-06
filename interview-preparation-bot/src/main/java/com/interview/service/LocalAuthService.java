package com.interview.service;

import com.interview.dto.CheckEmailResponse;
import com.interview.dto.LoginRequest;
import com.interview.dto.RegisterRequest;

import jakarta.servlet.http.HttpServletResponse;

/**
 * Handles local email/password authentication and account registration.
 */
public interface LocalAuthService {

	CheckEmailResponse checkEmail(String email);

	void register(RegisterRequest request);

	void login(LoginRequest request, HttpServletResponse httpServletResponse);
}