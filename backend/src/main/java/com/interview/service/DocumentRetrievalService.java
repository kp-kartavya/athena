package com.interview.service;

import java.util.List;

import org.springframework.ai.document.Document;

public interface DocumentRetrievalService {

	List<Document> similaritySearch(String query);

	List<Document> similaritySearch(String query, int topK);
}