package com.interview.service;

import java.util.List;

import org.springframework.ai.document.Document;

import reactor.core.publisher.Flux;

public interface ChatService {
	public String ask(String question);
	public List<Document> search(String question);
	public String ask(String question, boolean think);
	public Flux<String> askStream(String question, boolean think); 
}
