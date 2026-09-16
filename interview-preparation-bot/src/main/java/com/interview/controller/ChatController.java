package com.interview.controller;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.interview.service.ChatService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:8081", "http://localhost:30165",
		"http://athena.localhost" })
public class ChatController {
	private final ChatService chatService;

	@GetMapping("/ask")
	public String ask(@RequestParam String question) {
		return chatService.ask(question);
	}

	@GetMapping("/search")
	public List<String> search(@RequestParam String question) {
		return chatService.search(question).stream().map(Document::getText).toList();
	}

	@GetMapping(value = "/ask/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public Flux<String> askStream(@RequestParam String question, @RequestParam(defaultValue = "false") boolean think) {
		return chatService.askStream(question, think);
	}
}
