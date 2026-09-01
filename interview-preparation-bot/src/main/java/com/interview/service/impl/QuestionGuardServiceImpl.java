package com.interview.service.impl;


import org.springframework.stereotype.Service;

import com.interview.util.PromptUtil;

@Service
public class QuestionGuardServiceImpl {

	public boolean isTechnicalQuestion(String question) {
		if (question == null || question.isBlank()) {
			return false;
		}

		String normalizedQuestion = " " + question.toLowerCase().trim() + " ";

		return PromptUtil.TECHNICAL_KEYWORDS.stream().anyMatch(normalizedQuestion::contains);
	}
}