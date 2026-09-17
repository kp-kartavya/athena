package com.interview.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
@RequestMapping("/api/guest")
@RequiredArgsConstructor
public class GuestController {

	private final ChatService chatService;
	private final ChatHistoryService chatHistoryService;

	/**
	 * Existing lightweight guest question endpoint. Kept for compatibility.
	 */
	@PostMapping("/ask")
	public ResponseEntity<Map<String, String>> ask(@RequestBody Map<String, Object> request) {
		String question = String.valueOf(request.getOrDefault("question", "")).trim();
		boolean think = Boolean.parseBoolean(String.valueOf(request.getOrDefault("think", "false")));
		if (question.isBlank()) {
			return ResponseEntity.badRequest().body(Map.of("error", "Question is required."));
		}

		String answer = chatService.ask(question, think);
		return ResponseEntity.ok(Map.of("answer", answer));
	}

	/**
	 * Get all chats belonging to this guest browser session.
	 */
	@GetMapping("/chats")
	public ResponseEntity<List<Chat>> getGuestChats(@RequestParam String guestSessionId) {
		return ResponseEntity.ok(chatHistoryService.getGuestChats(guestSessionId));
	}

	/**
	 * Get one guest chat.
	 */
	@GetMapping("/chats/{chatId}")
	public ResponseEntity<Chat> getGuestChat(@PathVariable String chatId, @RequestParam String guestSessionId) {
		return ResponseEntity.ok(chatHistoryService.getGuestChat(chatId, guestSessionId));
	}

	/**
	 * Create a new guest chat.
	 */
	@PostMapping("/chats")
	public ResponseEntity<Chat> createGuestChat(@RequestParam String title, @RequestParam String guestSessionId) {
		return ResponseEntity.ok(chatHistoryService.createGuestChat(title, guestSessionId));
	}

	/**
	 * Add a message to a guest chat and stream Athena's answer.
	 */
	@PostMapping(value = "/chats/{chatId}/messages", produces = MediaType.TEXT_PLAIN_VALUE)
	public Flux<String> sendGuestMessage(@PathVariable String chatId, @RequestParam String guestSessionId,
			@RequestParam String question, @RequestParam(defaultValue = "false") boolean think) {
		String trimmedQuestion = question == null ? "" : question.trim();
		if (trimmedQuestion.isBlank()) {
			return Flux.error(new IllegalArgumentException("Question is required."));
		}

		chatHistoryService.addGuestMessage(chatId, guestSessionId, "user", trimmedQuestion);
		StringBuilder answerBuilder = new StringBuilder();

		return chatService.askStream(trimmedQuestion, think).doOnNext(answerBuilder::append).doOnComplete(() -> {
			String answer = answerBuilder.toString();
			try {
				chatHistoryService.addGuestMessage(chatId, guestSessionId, "assistant", answer);
				log.info("Saved streamed guest assistant response. chatId={}, guestSessionId={}, length={}", chatId,
						guestSessionId, answer.length());
			} catch (Exception e) {
				/*
				 * The response has already been streamed to the client. Do not fail the stream
				 * because persistence failed.
				 */
				log.error("Failed to save streamed guest assistant response. chatId={}, guestSessionId={}", chatId,
						guestSessionId, e);
			}
		});
	}

	/**
	 * Delete a guest chat.
	 */
	@DeleteMapping("/chats/{chatId}")
	public ResponseEntity<Void> deleteGuestChat(@PathVariable String chatId, @RequestParam String guestSessionId) {
		chatHistoryService.deleteGuestChat(chatId, guestSessionId);
		return ResponseEntity.noContent().build();
	}

	/**
	 * After a guest successfully logs in, transfer all guest chats from this
	 * browser session to the authenticated user's account.
	 */
	@PostMapping("/transfer")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<Map<String, Integer>> transferGuestChats(@RequestParam String guestSessionId) {
		int transferredCount = chatHistoryService.transferGuestChatsToUser(guestSessionId);
		return ResponseEntity.ok(Map.of("transferredCount", transferredCount));
	}
}