package com.interview;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class InterviewPreparationBotApplication {

	public static void main(String[] args) {
		SpringApplication.run(InterviewPreparationBotApplication.class, args);
	}

	@Bean
	SimpleVectorStore vectorStore(EmbeddingModel embeddingModel) {
		return SimpleVectorStore.builder(embeddingModel).build();
	}
	
	@Bean
	ChatClient chatClient(ChatClient.Builder builder) {
		return builder.build();
	}
}
