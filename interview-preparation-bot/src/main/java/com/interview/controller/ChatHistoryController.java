package com.interview.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.interview.model.Chat;
import com.interview.service.ChatHistoryService;
import com.interview.service.ChatService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173/")
public class ChatHistoryController {

	private final ChatHistoryService chatHistoryService;
	private final ChatService chatService;

	/* Get all recent chats. */
	@GetMapping
	public List<Chat> getAllChats() {
		return chatHistoryService.getAllChats();
	}

	/* Get one complete conversation. */
	@GetMapping("/{chatId}")
	public Chat getChat(@PathVariable String chatId) {
		return chatHistoryService.getChat(chatId);
	}

	/* Create a new chat. */
	@PostMapping
	public Chat createChat(@RequestParam String title) {
		return chatHistoryService.createChat(title);
	}

	/* Add a user message and generate the assistant response. */
	@PostMapping("/{chatId}/messages")
	public Chat sendMessage(@PathVariable String chatId, @RequestParam String question,
			@RequestParam(defaultValue = "false") boolean think) {
		chatHistoryService.addMessage(chatId, "user", question);
		String answer = chatService.ask(question, think);
		chatHistoryService.addMessage(chatId, "assistant", answer);
		return chatHistoryService.getChat(chatId);
	}

	/* Delete a conversation. */
	@DeleteMapping("/{chatId}")
	public ResponseEntity<Void> deleteChat(@PathVariable String chatId) {
		chatHistoryService.deleteChat(chatId);
		return ResponseEntity.noContent().build();
	}
}