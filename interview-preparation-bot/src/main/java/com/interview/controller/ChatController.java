package com.interview.controller;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.interview.service.ChatService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
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

}
