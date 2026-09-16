package com.interview.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
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
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;

@Slf4j
@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:8081", "http://localhost:30165",
		"http://athena.localhost" })
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

	/*
	 * Add a user message and stream the assistant response.
	 */
	@PostMapping(value = "/{chatId}/messages", produces = MediaType.TEXT_PLAIN_VALUE)
	public Flux<String> sendMessage(@PathVariable String chatId, @RequestParam String question,
			@RequestParam(defaultValue = "false") boolean think) {
		// Capture authentication while we are still on the request thread.
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		chatHistoryService.addMessage(chatId, "user", question);

		StringBuilder answerBuilder = new StringBuilder();

		return chatService.askStream(question, think).doOnNext(answerBuilder::append).doOnComplete(() -> {
			String answer = answerBuilder.toString();
			SecurityContext context = SecurityContextHolder.createEmptyContext();
			context.setAuthentication(authentication);
			try {
				SecurityContextHolder.setContext(context);
				chatHistoryService.addMessage(chatId, "assistant", answer);
				log.info("Saved streamed assistant response. chatId={}, length={}", chatId, answer.length());
			} catch (Exception e) {
				log.error("Failed to save streamed assistant response. chatId={}", chatId, e);
			} finally {
				SecurityContextHolder.clearContext();
			}
		});
	}

	/* Delete a conversation. */
	@DeleteMapping("/{chatId}")
	public ResponseEntity<Void> deleteChat(@PathVariable String chatId) {
		chatHistoryService.deleteChat(chatId);
		return ResponseEntity.noContent().build();
	}
}