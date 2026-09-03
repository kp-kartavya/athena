package com.interview.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.interview.model.Chat;
import com.interview.model.ChatMessage;
import com.interview.repo.ChatMessageRepository;
import com.interview.repo.ChatRepository;
import com.interview.service.ChatHistoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatHistoryServiceImpl implements ChatHistoryService {

	private final ChatRepository chatRepository;
	private final ChatMessageRepository chatMessageRepository;

	@Override
	public List<Chat> getAllChats() {
		return chatRepository.findAll();
	}

	@Override
	public Chat getChat(String chatId) {
		return chatRepository.findById(chatId)
				.orElseThrow(() -> new IllegalArgumentException("Chat not found: " + chatId));
	}

	@Override
	public Chat createChat(String title) {

		Chat chat = new Chat();

		chat.setId(UUID.randomUUID().toString());
		chat.setTitle(title);
		chat.setCreatedAt(LocalDateTime.now());
		chat.setUpdatedAt(LocalDateTime.now());

		return chatRepository.save(chat);
	}

	@Override
	@Transactional
	public ChatMessage addMessage(String chatId, String role, String content) {

		Chat chat = chatRepository.findById(chatId)
				.orElseThrow(() -> new IllegalArgumentException("Chat not found: " + chatId));

		ChatMessage message = new ChatMessage();

		message.setId(UUID.randomUUID().toString());
		message.setRole(role);
		message.setContent(content);
		message.setTimestamp(LocalDateTime.now());
		message.setChat(chat);

		ChatMessage savedMessage = chatMessageRepository.save(message);

		chat.setUpdatedAt(LocalDateTime.now());
		chatRepository.save(chat);

		return savedMessage;
	}

	@Override
	@Transactional
	public void deleteChat(String chatId) {

		Chat chat = chatRepository.findById(chatId)
				.orElseThrow(() -> new RuntimeException("Chat not found: " + chatId));

		chatRepository.delete(chat);
	}
}