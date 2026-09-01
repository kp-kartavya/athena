package com.interview.service.impl;

import java.io.File;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.interview.model.Chat;
import com.interview.model.ChatMessage;
import com.interview.service.ChatHistoryService;

import lombok.RequiredArgsConstructor;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class ChatHistoryServiceImpl implements ChatHistoryService {
	@Value("${chat.history.path}")
	private String CHAT_HISTORY_PATH;

	private final ObjectMapper objectMapper;

	/**
	 * Load all saved chats.
	 */
	@Override
	public List<Chat> getAllChats() {
		File file = new File(CHAT_HISTORY_PATH);

		if (!file.exists()) {
			return new ArrayList<>();
		}

		try {
			return objectMapper.readValue(file,
					objectMapper.getTypeFactory().constructCollectionType(List.class, Chat.class));
		} catch (Exception e) {
			throw new IllegalStateException("Failed to load chat history", e);
		}
	}

	/**
	 * Find a chat by its ID.
	 */
	@Override
	public Chat getChat(String chatId) {
		return getAllChats().stream().filter(chat -> chat.getId().equals(chatId)).findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Chat not found: " + chatId));
	}

	/**
	 * Create a new chat.
	 */
	@Override
	public Chat createChat(String title) {
		LocalDateTime now = LocalDateTime.now();

		Chat chat = new Chat();
		chat.setId(UUID.randomUUID().toString());
		chat.setTitle(title);
		chat.setCreatedAt(now);
		chat.setUpdatedAt(now);
		chat.setMessages(new ArrayList<>());

		List<Chat> chats = getAllChats();
		chats.add(0, chat);
		saveChats(chats);

		return chat;
	}

	/**
	 * Add a message to an existing chat.
	 */
	@Override
	public ChatMessage addMessage(String chatId, String role, String content) {
		List<Chat> chats = getAllChats();

		Chat chat = chats.stream().filter(item -> item.getId().equals(chatId)).findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Chat not found: " + chatId));

		ChatMessage message = new ChatMessage();

		message.setId(UUID.randomUUID().toString());
		message.setRole(role);
		message.setContent(content);
		message.setTimestamp(LocalDateTime.now());

		chat.getMessages().add(message);
		chat.setUpdatedAt(LocalDateTime.now());

		saveChats(chats);

		return message;
	}

	/**
	 * Delete a chat.
	 */
	@Override
	public void deleteChat(String chatId) {
		List<Chat> chats = getAllChats();

		boolean removed = chats.removeIf(chat -> chat.getId().equals(chatId));
		if (removed) {
			saveChats(chats);
		}
	}

	/**
	 * Save all chats to disk.
	 */
	private void saveChats(List<Chat> chats) {
		try {
			File file = new File(CHAT_HISTORY_PATH);
			File parent = file.getParentFile();

			if (parent != null) {
				parent.mkdirs();
			}

			objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, chats);
		} catch (Exception e) {
			throw new IllegalStateException("Failed to save chat history", e);
		}
	}
}