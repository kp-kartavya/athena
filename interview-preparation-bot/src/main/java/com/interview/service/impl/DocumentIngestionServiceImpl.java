package com.interview.service.impl;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.ai.document.Document;
import org.springframework.ai.reader.markdown.MarkdownDocumentReader;
import org.springframework.ai.reader.markdown.config.MarkdownDocumentReaderConfig;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.interview.model.DocumentChunk;
import com.interview.model.DocumentManifest;
import com.interview.repo.DocumentChunkRepository;
import com.interview.util.DocumentHashUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;

/**
 * Handles interview document ingestion and synchronization.
 *
 * Reads interview.md, creates stable chunks, persists chunk content and
 * metadata in PostgreSQL, and synchronizes embeddings with PostgreSQL pgvector.
 *
 * A PostgreSQL advisory lock ensures that only one backend replica performs
 * ingestion when multiple replicas start together.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentIngestionServiceImpl {

	private static final long INGESTION_LOCK_ID = 87456321L;

	@Value("${manifest.path}")
	private String MANIFEST_PATH;

	private final VectorStore vectorStore;
	private final ObjectMapper objectMapper;
	private final DocumentChunkRepository documentChunkRepository;
	private final JdbcTemplate jdbcTemplate;

	@EventListener(ApplicationReadyEvent.class)
	public void run() {
		jdbcTemplate.execute((ConnectionCallback<Void>) connection -> {
			try {
				acquireIngestionLock(connection);
				log.info("Starting document ingestion.");
				loadDocument();
			} catch (Exception e) {
				throw new IllegalStateException("Document ingestion failed.", e);
			} finally {
				releaseIngestionLock(connection);
			}

			return null;
		});
	}

	private void acquireIngestionLock(Connection connection) throws Exception {
		try (PreparedStatement statement = connection.prepareStatement("SELECT pg_advisory_lock(?)")) {
			statement.setLong(1, INGESTION_LOCK_ID);
			statement.execute();
		}
	}

	private void releaseIngestionLock(Connection connection) {
		try (PreparedStatement statement = connection.prepareStatement("SELECT pg_advisory_unlock(?)")) {
			statement.setLong(1, INGESTION_LOCK_ID);
			statement.execute();

			log.info("Document ingestion completed.");
		} catch (Exception e) {
			log.warn("Failed to release document ingestion lock.", e);
		}
	}

	public void loadDocument() {
		File manifestFile = new File(MANIFEST_PATH);

		ClassPathResource resource = new ClassPathResource("documents/interview.md");

		MarkdownDocumentReader reader = new MarkdownDocumentReader(resource,
				MarkdownDocumentReaderConfig.defaultConfig());

		List<Document> documents = reader.read();
		List<Document> handsOnDocuments = loadHandsOnQuestions(resource);
		documents.addAll(handsOnDocuments);

		log.info("Loaded {} documents and {} hands-on questions.", documents.size(), handsOnDocuments.size());

		DocumentManifest newManifest = new DocumentManifest();

		for (Document document : documents) {
			String title = (String) document.getMetadata().get("title");
			if (title != null && !title.isBlank()) {
				document.getMetadata().put("section", title);
			}
			document.getMetadata().put("source", "interview.md");
		}

		TokenTextSplitter splitter = TokenTextSplitter.builder().build();
		List<Document> chunks = new ArrayList<>();

		for (Document document : documents) {
			List<Document> documentChunks = splitter.apply(List.of(document));
			chunks.addAll(documentChunks);
		}

		log.info("Created {} document chunks.", chunks.size());

		Map<String, Document> currentChunks = new HashMap<>();

		Map<String, Integer> sectionCounters = new HashMap<>();

		for (Document chunk : chunks) {

			String section = (String) chunk.getMetadata().get("section");

			if (section == null || section.isBlank()) {
				section = "UNKNOWN";
				chunk.getMetadata().put("section", section);
			}

			int chunkIndex = sectionCounters.getOrDefault(section, 0);

			sectionCounters.put(section, chunkIndex + 1);

			String chunkId = DocumentHashUtil.generateChunkId(section, chunkIndex);

			String contentHash = DocumentHashUtil.generateHash(chunk.getText());

			chunk.getMetadata().put("chunkId", chunkId);
			chunk.getMetadata().put("contentHash", contentHash);

			DocumentChunk dbChunk = documentChunkRepository.findByChunkId(chunkId).orElseGet(DocumentChunk::new);

			LocalDateTime now = LocalDateTime.now();

			dbChunk.setChunkId(chunkId);
			dbChunk.setSection(section);
			dbChunk.setChunkIndex(chunkIndex);
			dbChunk.setContent(chunk.getText());
			dbChunk.setContentHash(contentHash);
			dbChunk.setSource((String) chunk.getMetadata().getOrDefault("source", "interview.md"));
			dbChunk.setType((String) chunk.getMetadata().getOrDefault("type", "KNOWLEDGE"));

			if (dbChunk.getCreatedAt() == null) {
				dbChunk.setCreatedAt(now);
			}

			dbChunk.setUpdatedAt(now);
			documentChunkRepository.save(dbChunk);

			currentChunks.put(chunkId, chunk);

			newManifest.getChunks().put(chunkId, contentHash);
			newManifest.getSections().put(section, chunkId);
		}

		removeDeletedChunks(currentChunks);
		synchronizeVectorStore(currentChunks);
		saveManifest(newManifest, manifestFile);
	}

	private void synchronizeVectorStore(Map<String, Document> currentChunks) {
		Map<String, String> vectorMetadata = loadVectorMetadata();
		List<Document> documentsToEmbed = new ArrayList<>();

		for (Map.Entry<String, Document> entry : currentChunks.entrySet()) {
			String chunkId = entry.getKey();
			Document currentChunk = entry.getValue();
			String currentHash = (String) currentChunk.getMetadata().get("contentHash");
			String vectorHash = vectorMetadata.get(chunkId);

			if (vectorHash == null) {
				documentsToEmbed.add(currentChunk);
				continue;
			}

			if (!vectorHash.equals(currentHash)) {
				vectorStore.delete("chunkId == '" + chunkId + "'");
				documentsToEmbed.add(currentChunk);
			}
		}

		Set<String> currentChunkIds = new HashSet<>(currentChunks.keySet());

		for (String vectorChunkId : vectorMetadata.keySet()) {
			if (!currentChunkIds.contains(vectorChunkId)) {
				vectorStore.delete("chunkId == '" + vectorChunkId + "'");
			}
		}

		if (!documentsToEmbed.isEmpty()) {
			log.info("Generating embeddings for {} chunks.", documentsToEmbed.size());
			vectorStore.add(documentsToEmbed);
			log.info("Embeddings synchronized with PostgreSQL.");
		} else {

			log.info("Embeddings are already up to date.");
		}
	}

	private Map<String, String> loadVectorMetadata() {
		Map<String, String> vectorMetadata = new HashMap<>();

		List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
				SELECT
				    metadata ->> 'chunkId' AS chunk_id,
				    metadata ->> 'contentHash' AS content_hash
				FROM vector_store
				WHERE metadata ->> 'chunkId' IS NOT NULL
				""");

		for (Map<String, Object> row : rows) {
			String chunkId = (String) row.get("chunk_id");
			String contentHash = (String) row.get("content_hash");

			if (chunkId != null) {
				vectorMetadata.put(chunkId, contentHash);
			}
		}

		log.info("Found {} existing vectors.", vectorMetadata.size());

		return vectorMetadata;
	}

	private void saveManifest(DocumentManifest manifest, File manifestFile) {

		try {

			if (manifestFile.getParentFile() != null) {
				manifestFile.getParentFile().mkdirs();
			}

			objectMapper.writerWithDefaultPrettyPrinter().writeValue(manifestFile, manifest);

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

				if (trimmed.equalsIgnoreCase("## STREAM HANDS-ON QUESTIONS")) {

					insideHandsOnSection = true;
					continue;
				}

				if (insideHandsOnSection && trimmed.equalsIgnoreCase("## Interview Experience")) {
					break;
				}

				if (insideHandsOnSection && trimmed.startsWith("## ")) {
					String question = trimmed.substring(3).trim();

					Document document = new Document(question);
					document.getMetadata().put("section", question);
					document.getMetadata().put("source", "interview.md");
					document.getMetadata().put("type", "HANDS_ON");

					handsOnDocuments.add(document);
				}
			}

		} catch (Exception e) {
			throw new IllegalStateException("Failed to read hands-on questions from interview.md", e);
		}

		return handsOnDocuments;
	}

	private void removeDeletedChunks(Map<String, Document> currentChunks) {

		List<DocumentChunk> dbChunks = documentChunkRepository.findAll();

		for (DocumentChunk dbChunk : dbChunks) {
			if (!currentChunks.containsKey(dbChunk.getChunkId())) {
				documentChunkRepository.delete(dbChunk);
			}
		}
	}
}