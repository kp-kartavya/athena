package com.interview.service;

import java.util.List;

import com.interview.model.Chat;
import com.interview.model.ChatMessage;

public interface ChatHistoryService {

	// Authenticated user chats
	List<Chat> getAllChats();

	Chat getChat(String chatId);

	Chat createChat(String title);

	ChatMessage addMessage(String chatId, String role, String content);

	void deleteChat(String chatId);

	// Guest chats
	List<Chat> getGuestChats(String guestSessionId);

	Chat getGuestChat(String chatId, String guestSessionId);

	Chat createGuestChat(String title, String guestSessionId);

	ChatMessage addGuestMessage(String chatId, String guestSessionId, String role, String content);

	void deleteGuestChat(String chatId, String guestSessionId);

	// Transfer guest chats to an authenticated user
	int transferGuestChatsToUser(String guestSessionId);
}