package com.interview.service.impl;

import java.io.File;
import java.util.List;
import java.util.Map;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.interview.model.DocumentManifest;
import com.interview.service.ChatService;
import com.interview.service.DocumentRetrievalService;
import com.interview.util.PromptUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;

/**
 * Handles interview question answering.
 *
 * Normal mode uses PostgreSQL pgvector-backed retrieval and persisted document
 * chunks as RAG context.
 *
 * Think mode answers technical and programming questions using the LLM's own
 * knowledge without using interview document retrieval.
 *
 * Exact section matching is attempted before semantic search.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

	@Value("${manifest.path}")
	private String MANIFEST_PATH;

	private final ChatClient chatClient;
	private final DocumentRetrievalService documentRetrievalService;
	private final ObjectMapper objectMapper;
	private final QuestionGuardServiceImpl questionGuardServiceImpl;

	@Override
	public String ask(String question) {

		return ask(question, false);
	}

	@Override
	public String ask(String question, boolean think) {
		log.info("Processing question. Think mode: {}", think);

		if (think) {
			boolean technical = questionGuardServiceImpl.isTechnicalQuestion(question);
			if (!technical) {
				log.info("Think mode rejected: non-technical question.");
				return "Think mode is only available for technical and coding-related questions.";
			}

			log.info("Think mode enabled.");
			return chatClient.prompt().system(PromptUtil.THINK_MODE_PROMPT).user(question).call().content();
		}

		List<Document> documents = search(question);

		if (documents.isEmpty()) {
			log.info("No relevant interview content found.");
			return "I can only answer questions covered by the interview material.";
		}

		String context = documents.stream().map(Document::getText).reduce("", (a, b) -> a + "\n\n" + b);

		boolean handsOn = documents.stream()
				.anyMatch(document -> "HANDS_ON".equals(document.getMetadata().get("type")));

		if (handsOn) {
			log.info("Generating hands-on solution.");
			return chatClient.prompt().system(PromptUtil.ASK_PROMPT_HANDSON).user("""
					Question:
					%s
					""".formatted(question)).call().content();
		}

		log.info("Generating interview answer using retrieved context.");

		return chatClient.prompt().system(PromptUtil.ASK_PROMPT).user("""
				Context:
				%s

				Question:
				%s
				""".formatted(context, question)).call().content();
	}

	@Override
	public List<Document> search(String question) {
		String normalizedQuestion = question.trim();

		DocumentManifest manifest = loadManifest();

		String matchedSection = findExactSection(normalizedQuestion, manifest.getSections());

		if (matchedSection != null) {
			log.info("Exact section match found.");
			List<Document> exactDocuments = documentRetrievalService.similaritySearch(matchedSection, 1);

			if (!exactDocuments.isEmpty()) {
				return exactDocuments;
			}

			log.info("Exact section retrieval returned no result. Using semantic search.");
		}

		List<Document> documents = documentRetrievalService.similaritySearch(normalizedQuestion, 2);

		log.info("Semantic retrieval returned {} documents.", documents.size());

		return documents;
	}

	private String findExactSection(String question, Map<String, String> sections) {
		if (sections == null || sections.isEmpty()) {
			return null;
		}

		for (String section : sections.keySet()) {
			if (section.equalsIgnoreCase(question)) {
				return section;
			}
		}

		return null;
	}

	private DocumentManifest loadManifest() {
		File manifestFile = new File(MANIFEST_PATH);

		if (!manifestFile.exists()) {
			return new DocumentManifest();
		}

		try {
			return objectMapper.readValue(manifestFile, DocumentManifest.class);
		} catch (Exception e) {
			throw new IllegalStateException("Failed to load document manifest", e);
		}
	}
}