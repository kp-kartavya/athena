package com.interview.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "document_chunks")
public class DocumentChunk {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String chunkId;

	@Column(nullable = false)
	private String section;

	@Column(nullable = false)
	private Integer chunkIndex;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String content;

	@Column(nullable = false)
	private String contentHash;

	@Column(nullable = false)
	private String source;

	private String type;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;
}