package com.interview.service;

import java.util.List;

import com.interview.model.Chat;
import com.interview.model.ChatMessage;

public interface ChatHistoryService {
	public List<Chat> getAllChats();
	public Chat getChat(String chatId);
	public Chat createChat(String title);
	public ChatMessage addMessage(String chatId, String role, String content);
	public void deleteChat(String chatId);
}
