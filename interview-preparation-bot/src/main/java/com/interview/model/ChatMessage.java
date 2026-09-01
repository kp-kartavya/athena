package com.interview.model;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ChatMessage {

    private String id;

    private String role;

    private String content;

    private LocalDateTime timestamp;
}