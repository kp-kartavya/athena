package com.interview.service.impl;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import com.interview.util.PromptUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionGuardServiceImpl {

	private final ChatClient chatClient;

	public boolean isTechnicalQuestion(String question) {

		if (question == null || question.isBlank()) {

			log.info("Question is empty.");

			return false;
		}

		String normalizedQuestion = question.trim();

		log.info("Classifying question as technical/non-technical: {}", normalizedQuestion);

		try {

			String response = chatClient.prompt().system(PromptUtil.QUESTION_GUARD_PROMPT).user(normalizedQuestion)
					.call().content();

			if (response == null || response.isBlank()) {

				log.warn("Question guard returned an empty response.");

				return false;
			}

			String classification = response.trim().toUpperCase();

			/*
			 * The classifier is instructed to return only:
			 *
			 * TECHNICAL or NON_TECHNICAL
			 *
			 * We check TECHNICAL explicitly.
			 */
			boolean technical = classification.contains("TECHNICAL") && !classification.contains("NON_TECHNICAL");

			log.info("Question guard classification: {} | Technical: {}", classification, technical);

			return technical;

		} catch (Exception e) {

			log.error("Failed to classify question.", e);

			/*
			 * Fail closed.
			 *
			 * If the classifier itself fails, Think mode should not bypass the
			 * technical-question guard.
			 */
			return false;
		}
	}
}