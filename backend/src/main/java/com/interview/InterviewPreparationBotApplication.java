package com.interview;

import java.util.TimeZone;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

/**
 * Main application configuration.
 *
 * Configures the shared PostgreSQL pgvector store used for embedding generation
 * and similarity search, along with the application ChatClient.
 */
@SpringBootApplication
public class InterviewPreparationBotApplication {

	public static void main(String[] args) {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
		SpringApplication.run(InterviewPreparationBotApplication.class, args);
	}

	@Bean
	ChatClient chatClient(ChatClient.Builder builder) {
		return builder.build();
	}
}