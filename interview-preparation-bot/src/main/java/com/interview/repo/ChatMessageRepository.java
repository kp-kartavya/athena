package com.interview.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.interview.model.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
}