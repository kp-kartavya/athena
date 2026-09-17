package com.interview.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Describes the authentication options available for an email address.
 */
@Data
@AllArgsConstructor
public class CheckEmailResponse {

    private boolean exists;
    private List<String> providers;
}