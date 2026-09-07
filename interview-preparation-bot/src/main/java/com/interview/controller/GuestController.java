package com.interview.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interview.dto.GuestAskRequest;
import com.interview.service.ChatService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/guest")
@RequiredArgsConstructor
public class GuestController {

	private final ChatService chatService;

	@PostMapping("/ask")
	public ResponseEntity<Map<String, String>> ask(@Valid @RequestBody GuestAskRequest request) {
		String answer = chatService.ask(request.getQuestion().trim());
		return ResponseEntity.ok(Map.of("answer", answer));
	}
}