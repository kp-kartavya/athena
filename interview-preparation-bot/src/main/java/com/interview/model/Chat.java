package com.interview.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class Chat {

	private String id;

	private String title;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	private List<ChatMessage> messages = new ArrayList<>();
}