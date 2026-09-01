package com.interview.service.impl;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.ai.document.Document;
import org.springframework.ai.reader.markdown.MarkdownDocumentReader;
import org.springframework.ai.reader.markdown.config.MarkdownDocumentReaderConfig;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.interview.model.DocumentManifest;
import com.interview.util.DocumentHashUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentIngestionServiceImpl implements CommandLineRunner {
	@Value("${vector.store.path}")
	private String VECTOR_STORE_PATH;
	@Value("${manifest.path}")
	private String MANIFEST_PATH;

	private final SimpleVectorStore vectorStore;

	private final ObjectMapper objectMapper;

	@Override
	public void run(String... args) {

		loadDocument();
	}

	public void loadDocument() {

		File vectorStoreFile = new File(VECTOR_STORE_PATH);

		File manifestFile = new File(MANIFEST_PATH);

		/* Load existing vector store if available. */
		if (vectorStoreFile.exists()) {

			log.info("Vector store found. Loading existing embeddings...");

			vectorStore.load(vectorStoreFile);

			log.info("Vector store loaded successfully.");
		}

		/* Load previous manifest. */
		DocumentManifest oldManifest = loadManifest(manifestFile);

		/* Read Markdown document. */
		ClassPathResource resource = new ClassPathResource("documents/interview.md");

		MarkdownDocumentReader reader = new MarkdownDocumentReader(resource,
				MarkdownDocumentReaderConfig.defaultConfig());

		List<Document> documents = reader.read();

		log.info("Documents loaded: {}", documents.size());

		List<Document> handsOnDocuments = loadHandsOnQuestions(resource);

		documents.addAll(handsOnDocuments);

		log.info("Added {} hands-on questions.", handsOnDocuments.size());

		log.info("Total documents after hands-on questions: {}", documents.size());

		DocumentManifest newManifest = new DocumentManifest();

		/* Add metadata. */
		for (Document document : documents) {
			String title = (String) document.getMetadata().get("title");
			if (title != null && !title.isBlank()) {
				document.getMetadata().put("section", title);
			}
			document.getMetadata().put("source", "interview.md");
		}

		/* Create chunks. */
		TokenTextSplitter splitter = TokenTextSplitter.builder().build();

		List<Document> chunks = new ArrayList<>();

		for (Document document : documents) {

			List<Document> documentChunks = splitter.apply(List.of(document));

			chunks.addAll(documentChunks);
		}

		log.info("Total chunks created: {}", chunks.size());

		/* Create current manifest. */
		Map<String, Document> currentChunks = new HashMap<>();

		/* Generate stable IDs and hashes. */
		Map<String, Integer> sectionCounters = new HashMap<>();

		for (Document chunk : chunks) {
			String section = (String) chunk.getMetadata().get("section");

			int chunkIndex = sectionCounters.getOrDefault(section, 0);
			sectionCounters.put(section, chunkIndex + 1);

			String chunkId = DocumentHashUtil.generateChunkId(section, chunkIndex);
			String contentHash = DocumentHashUtil.generateHash(chunk.getText());

			chunk.getMetadata().put("chunkId", chunkId);
			chunk.getMetadata().put("contentHash", contentHash);

			currentChunks.put(chunkId, chunk);
			newManifest.getChunks().put(chunkId, contentHash);
			newManifest.getSections().put(section, chunkId);

			log.info("Section: {} | Chunk Index: {} | Chunk ID: {} | Hash: {}", section, chunkIndex, chunkId,
					contentHash);
		}

		/* Detect changes. */
		List<Document> documentsToEmbed = new ArrayList<>();

		for (Map.Entry<String, Document> entry : currentChunks.entrySet()) {
			String chunkId = entry.getKey();
			Document currentChunk = entry.getValue();
			String currentHash = (String) currentChunk.getMetadata().get("contentHash");
			String oldHash = oldManifest.getChunks().get(chunkId);
			if (oldHash == null) {
				log.info("NEW chunk detected: {}", chunkId);
				documentsToEmbed.add(currentChunk);
			} else if (!oldHash.equals(currentHash)) {
				log.info("CHANGED chunk detected: {}", chunkId);
				vectorStore.delete("chunkId == '" + chunkId + "'");
				documentsToEmbed.add(currentChunk);
			}
		}

		/* Detect removed chunks. */
		for (String oldChunkId : oldManifest.getChunks().keySet()) {
			if (!currentChunks.containsKey(oldChunkId)) {
				log.info("REMOVED chunk detected: {}", oldChunkId);
				vectorStore.delete("chunkId == '" + oldChunkId + "'");
			}
		}

		/* Add new/changed embeddings. */
		if (!documentsToEmbed.isEmpty()) {
			log.info("Generating embeddings for {} chunks...", documentsToEmbed.size());
			vectorStore.add(documentsToEmbed);
		} else {
			log.info("No new or changed chunks found.");
		}

		/* Save vector store. */
		vectorStoreFile.getParentFile().mkdirs();
		vectorStore.save(vectorStoreFile);

		log.info("Vector store saved to: {}", VECTOR_STORE_PATH);
		/* Save manifest. */
		saveManifest(newManifest, manifestFile);
	}

	private DocumentManifest loadManifest(File manifestFile) {
		if (!manifestFile.exists()) {
			log.info("Document manifest not found. Creating new manifest.");
			return new DocumentManifest();
		}

		try {
			return objectMapper.readValue(manifestFile, DocumentManifest.class);
		} catch (Exception e) {
			throw new IllegalStateException("Failed to load document manifest", e);
		}
	}

	private void saveManifest(DocumentManifest manifest, File manifestFile) {
		try {
			manifestFile.getParentFile().mkdirs();
			objectMapper.writerWithDefaultPrettyPrinter().writeValue(manifestFile, manifest);
			log.info("Document manifest saved to: {}", MANIFEST_PATH);
		} catch (Exception e) {
			throw new IllegalStateException("Failed to save document manifest", e);
		}
	}

	private List<Document> loadHandsOnQuestions(ClassPathResource resource) {
		List<Document> handsOnDocuments = new ArrayList<>();
		boolean insideHandsOnSection = false;

		try (BufferedReader reader = new BufferedReader(
				new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

			String line;
			while ((line = reader.readLine()) != null) {
				String trimmed = line.trim();
				/* Start of hands-on section */
				if (trimmed.equalsIgnoreCase("## STREAM HANDS-ON QUESTIONS")) {
					insideHandsOnSection = true;
					continue;
				}

				/* End of hands-on section */
				if (insideHandsOnSection && trimmed.equalsIgnoreCase("## Interview Experience")) {
					break;
				}

				/* Collect the hands-on question headings. */
				if (insideHandsOnSection && trimmed.startsWith("## ")) {
					String question = trimmed.substring(3).trim();
					Document document = new Document(question);
					document.getMetadata().put("section", question);
					document.getMetadata().put("source", "interview.md");
					document.getMetadata().put("type", "HANDS_ON");
					handsOnDocuments.add(document);
					log.info("Hands-on question created: {}", question);
				}
			}
		} catch (Exception e) {
			throw new IllegalStateException("Failed to read hands-on questions from interview.md", e);
		}

		return handsOnDocuments;
	}
}