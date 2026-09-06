package com.interview.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import com.interview.model.DocumentChunk;
import com.interview.repo.DocumentChunkRepository;
import com.interview.service.DocumentRetrievalService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Retrieves relevant interview content using PostgreSQL pgvector.
 *
 * Vector search identifies the relevant chunk IDs, while document_chunks
 * remains the source of truth for chunk content and metadata returned to the
 * LLM.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentRetrievalServiceImpl implements DocumentRetrievalService {

	private final VectorStore vectorStore;
	private final DocumentChunkRepository documentChunkRepository;

	@Override
	public List<Document> similaritySearch(String query) {
		return similaritySearch(query, 5);
	}

	@Override
	public List<Document> similaritySearch(String query, int topK) {

		List<Document> vectorResults = vectorStore
				.similaritySearch(SearchRequest.builder().query(query).topK(topK).build());

		if (vectorResults == null || vectorResults.isEmpty()) {
			log.info("No vector results found.");
			return List.of();
		}

		List<String> chunkIds = new ArrayList<>();

		for (Document document : vectorResults) {
			Object chunkId = document.getMetadata().get("chunkId");

			if (chunkId != null) {
				chunkIds.add(chunkId.toString());
			}
		}

		if (chunkIds.isEmpty()) {
			log.warn("Vector results contain no chunk IDs.");
			return List.of();
		}

		List<DocumentChunk> dbChunks = documentChunkRepository.findByChunkIdIn(chunkIds);

		Map<String, DocumentChunk> dbChunkMap = new HashMap<>();

		for (DocumentChunk dbChunk : dbChunks) {
			dbChunkMap.put(dbChunk.getChunkId(), dbChunk);
		}

		List<Document> results = new ArrayList<>();

		for (Document vectorDocument : vectorResults) {

			Object chunkIdObject = vectorDocument.getMetadata().get("chunkId");

			if (chunkIdObject == null) {
				continue;
			}

			String chunkId = chunkIdObject.toString();

			DocumentChunk dbChunk = dbChunkMap.get(chunkId);

			if (dbChunk == null) {
				log.warn("Vector chunk {} not found in document_chunks.", chunkId);
				continue;
			}

			Map<String, Object> metadata = new HashMap<>();

			metadata.put("chunkId", dbChunk.getChunkId());
			metadata.put("section", dbChunk.getSection());
			metadata.put("chunkIndex", dbChunk.getChunkIndex());
			metadata.put("contentHash", dbChunk.getContentHash());
			metadata.put("source", dbChunk.getSource());
			metadata.put("type", dbChunk.getType());

			results.add(new Document(dbChunk.getContent(), metadata));
		}

		return results;
	}
}