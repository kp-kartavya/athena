package com.interview.repo;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.interview.model.DocumentChunk;

public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {

	Optional<DocumentChunk> findByChunkId(String chunkId);

	List<DocumentChunk> findByChunkIdIn(Collection<String> chunkIds);

	void deleteByChunkId(String chunkId);
}