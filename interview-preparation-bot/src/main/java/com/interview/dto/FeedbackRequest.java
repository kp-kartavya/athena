package com.interview.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

/**
 * Request payload for submitting Athena feedback.
 */
@Getter
@Setter
public class FeedbackRequest {

    @Min(value = 1, message = "Rating must be between 1 and 5.")
    @Max(value = 5, message = "Rating must be between 1 and 5.")
    private int rating;

    @NotBlank(message = "Feedback is required.")
    @Size(max = 2000, message = "Feedback must not exceed 2000 characters.")
    private String feedback;

    @Size(max = 2000, message = "Improvement feedback must not exceed 2000 characters.")
    private String improvement;

    @Size(max = 100, message = "Name must not exceed 100 characters.")
    private String name;

    @Email(message = "Please enter a valid email address.")
    @Size(max = 254, message = "Email must not exceed 254 characters.")
    private String email;
}