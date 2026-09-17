package com.interview.controller;

import java.util.Map;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exposes the CSRF token to the frontend application.
 */
@RestController
@RequestMapping("/api/auth")
public class CsrfController {

    @GetMapping("/csrf")
    public Map<String, String> getCsrfToken(CsrfToken csrfToken) {
        return Map.of("token", csrfToken.getToken());
    }
}