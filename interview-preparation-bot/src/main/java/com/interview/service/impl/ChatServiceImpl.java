package com.interview.service.impl;

import java.io.File;
import java.util.List;
import java.util.Map;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.interview.model.DocumentManifest;
import com.interview.service.ChatService;
import com.interview.util.PromptUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
	@Value("${manifest.path}")
	private String MANIFEST_PATH;
	private final ChatClient chatClient;
	private final VectorStore vectorStore;
	private final ObjectMapper objectMapper;
	private final QuestionGuardServiceImpl questionGuardServiceImpl;

//	@Override
//	public String ask(String question) {
//		log.info("User question: {}", question);
//		List<Document> documents = search(question);
//
//		if (documents.isEmpty()) {
//			log.info("No relevant documents found.");
//			return "I can only answer questions covered by the interview material.";
//		}
//
//		String context = documents.stream().map(Document::getText).reduce("", (a, b) -> a + "\n\n" + b);
//		boolean handsOn = documents.stream()
//				.anyMatch(document -> "HANDS_ON".equals(document.getMetadata().get("type")));
//
//		log.info("Question classified as HANDS_ON: {}", handsOn);
//		if (handsOn) {
//			log.info("Generating hands-on solution.");
//
//			return chatClient.prompt().system(PromptUtil.ASK_PROMPT_HANDSON).user("""
//					Question:
//					%s
//					""".formatted(question)).call().content();
//		}
//
//		log.info("Generating normal interview answer.");
//
//		return chatClient.prompt().system(PromptUtil.ASK_PROMPT).user("""
//				Context:
//				%s
//
//				Question:
//				%s
//				""".formatted(context, question)).call().content();
//	}

	@Override
	public String ask(String question) {
		return ask(question, false);
	}

	@Override
	public String ask(String question, boolean think) {

		log.info("User question: {}", question);
		log.info("Think mode: {}", think);

		/*
		 * THINK MODE
		 *
		 * Only allow technical questions. Do NOT use RAG/vector store.
		 */
		if (think) {

			boolean technical = questionGuardServiceImpl.isTechnicalQuestion(question);

			log.info("Question classified as technical: {}", technical);

			if (!technical) {

				log.info("Rejecting non-technical question in Think mode.");

				return "Think mode is only available for technical and coding-related questions.";
			}

			log.info("Think mode enabled. Skipping vector store.");

			return chatClient.prompt().system(PromptUtil.THINK_MODE_PROMPT).user(question).call().content();
		}

		/*
		 * NORMAL MODE
		 *
		 * Use your existing RAG pipeline.
		 */
		List<Document> documents = search(question);

		if (documents.isEmpty()) {

			log.info("No relevant documents found.");

			return "I can only answer questions covered by the interview material.";
		}

		String context = documents.stream().map(Document::getText).reduce("", (a, b) -> a + "\n\n" + b);

		boolean handsOn = documents.stream()
				.anyMatch(document -> "HANDS_ON".equals(document.getMetadata().get("type")));

		log.info("Question classified as HANDS_ON: {}", handsOn);

		if (handsOn) {

			log.info("Generating hands-on solution.");

			return chatClient.prompt().system(PromptUtil.ASK_PROMPT_HANDSON).user("""
					Question:
					%s
					""".formatted(question)).call().content();
		}

		log.info("Generating normal interview answer.");

		return chatClient.prompt().system(PromptUtil.ASK_PROMPT).user("""
				Context:
				%s

				Question:
				%s
				""".formatted(context, question)).call().content();
	}

	@Override
	public List<Document> search(String question) {
		log.info("Searching vector store for: {}", question);
		String normalizedQuestion = question.trim();
		/* First try to identify an exact section from the manifest. */
		DocumentManifest manifest = loadManifest();
		String matchedSection = findExactSection(normalizedQuestion, manifest.getSections());
		if (matchedSection != null) {
			log.info("Exact section match found: {}", matchedSection);
			/*
			 * Search using the exact section title.
			 *
			 * This gives the embedding model the cleanest possible query for short headings
			 * such as:
			 *
			 * Word count Character count Highest salary
			 */
			List<Document> exactDocuments = vectorStore.similaritySearch(
					SearchRequest.builder().query(matchedSection).topK(1).similarityThreshold(0.5).build());
			if (!exactDocuments.isEmpty()) {
				log.info("Exact section retrieval returned {} document.", exactDocuments.size());
				for (Document document : exactDocuments) {
					log.info("Retrieved exact section: {} | Score: {}", document.getMetadata().get("section"),
							document.getScore());
				}
				return exactDocuments;
			}
		}

		/* Fall back to normal semantic search. */
		List<Document> documents = vectorStore.similaritySearch(
				SearchRequest.builder().query(normalizedQuestion).topK(2).similarityThreshold(0.5).build());

		log.info("Retrieved {} documents using semantic search.", documents.size());

		for (Document document : documents) {

			log.info("Retrieved section: {} | Score: {}", document.getMetadata().get("section"), document.getScore());
		}

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
			log.info("Manifest not found while searching.");
			return new DocumentManifest();
		}
		try {
			return objectMapper.readValue(manifestFile, DocumentManifest.class);
		} catch (Exception e) {
			throw new IllegalStateException("Failed to load document manifest", e);
		}
	}
}
