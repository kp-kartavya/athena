package com.interview.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.interview.model.Chat;
import com.interview.model.ChatMessage;
import com.interview.model.User;
import com.interview.repo.ChatMessageRepository;
import com.interview.repo.ChatRepository;
import com.interview.repo.UserRepository;
import com.interview.service.ChatHistoryService;
import com.interview.util.OAuth2UserUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatHistoryServiceImpl implements ChatHistoryService {

	private final ChatRepository chatRepository;
	private final ChatMessageRepository chatMessageRepository;
	private final UserRepository userRepository;

	@Override
	public List<Chat> getAllChats() {
		User user = getCurrentUser();
		return chatRepository.findByUser(user);
	}

	@Override
	public Chat getChat(String chatId) {
		User user = getCurrentUser();

		return chatRepository.findById(chatId)
				.filter(chat -> chat.getUser() != null && chat.getUser().getId().equals(user.getId()))
				.orElseThrow(() -> new IllegalArgumentException("Chat not found: " + chatId));
	}

	@Override
	public Chat createChat(String title) {
		User user = getCurrentUser();

		Chat chat = new Chat();
		chat.setId(UUID.randomUUID().toString());
		chat.setTitle(title);
		chat.setCreatedAt(LocalDateTime.now());
		chat.setUpdatedAt(LocalDateTime.now());
		chat.setUser(user);
		chat.setGuestSessionId(null);

		return chatRepository.save(chat);
	}

	@Override
	@Transactional
	public ChatMessage addMessage(String chatId, String role, String content) {
		User user = getCurrentUser();

		Chat chat = chatRepository.findById(chatId).filter(
				existingChat -> existingChat.getUser() != null && existingChat.getUser().getId().equals(user.getId()))
				.orElseThrow(() -> new IllegalArgumentException("Chat not found: " + chatId));

		ChatMessage message = new ChatMessage();
		message.setId(UUID.randomUUID().toString());
		message.setRole(role);
		message.setContent(content);
		message.setTimestamp(LocalDateTime.now());
		message.setChat(chat);

		ChatMessage savedMessage = chatMessageRepository.save(message);

		chat.setUpdatedAt(LocalDateTime.now());
		chatRepository.save(chat);

		return savedMessage;
	}

	@Override
	@Transactional
	public void deleteChat(String chatId) {
		User user = getCurrentUser();

		Chat chat = chatRepository.findById(chatId).filter(
				existingChat -> existingChat.getUser() != null && existingChat.getUser().getId().equals(user.getId()))
				.orElseThrow(() -> new IllegalArgumentException("Chat not found: " + chatId));

		chatRepository.delete(chat);
	}

	@Override
	@Transactional(readOnly = true)
	public List<Chat> getGuestChats(String guestSessionId) {
		validateGuestSessionId(guestSessionId);

		return chatRepository.findByGuestSessionIdOrderByUpdatedAtDesc(guestSessionId);
	}

	@Override
	@Transactional(readOnly = true)
	public Chat getGuestChat(String chatId, String guestSessionId) {
		validateGuestSessionId(guestSessionId);

		return chatRepository.findById(chatId)
				.filter(chat -> guestSessionId.equals(chat.getGuestSessionId()) && chat.getUser() == null)
				.orElseThrow(() -> new IllegalArgumentException("Guest chat not found: " + chatId));
	}

	@Override
	@Transactional
	public Chat createGuestChat(String title, String guestSessionId) {
		validateGuestSessionId(guestSessionId);

		Chat chat = new Chat();
		chat.setId(UUID.randomUUID().toString());
		chat.setTitle(title);
		chat.setCreatedAt(LocalDateTime.now());
		chat.setUpdatedAt(LocalDateTime.now());
		chat.setUser(null);
		chat.setGuestSessionId(guestSessionId);

		return chatRepository.save(chat);
	}

	@Override
	@Transactional
	public ChatMessage addGuestMessage(String chatId, String guestSessionId, String role, String content) {

		validateGuestSessionId(guestSessionId);

		Chat chat = chatRepository.findById(chatId)
				.filter(existingChat -> guestSessionId.equals(existingChat.getGuestSessionId())
						&& existingChat.getUser() == null)
				.orElseThrow(() -> new IllegalArgumentException("Guest chat not found: " + chatId));

		ChatMessage message = new ChatMessage();
		message.setId(UUID.randomUUID().toString());
		message.setRole(role);
		message.setContent(content);
		message.setTimestamp(LocalDateTime.now());
		message.setChat(chat);

		ChatMessage savedMessage = chatMessageRepository.save(message);

		chat.setUpdatedAt(LocalDateTime.now());
		chatRepository.save(chat);

		return savedMessage;
	}

	@Override
	@Transactional
	public void deleteGuestChat(String chatId, String guestSessionId) {
		validateGuestSessionId(guestSessionId);

		Chat chat = chatRepository.findById(chatId)
				.filter(existingChat -> guestSessionId.equals(existingChat.getGuestSessionId())
						&& existingChat.getUser() == null)
				.orElseThrow(() -> new IllegalArgumentException("Guest chat not found: " + chatId));

		chatRepository.delete(chat);
	}

	@Override
	@Transactional
	public int transferGuestChatsToUser(String guestSessionId) {
		validateGuestSessionId(guestSessionId);

		User user = getCurrentUser();

		List<Chat> guestChats = chatRepository.findByGuestSessionId(guestSessionId);

		int transferredCount = 0;

		for (Chat chat : guestChats) {
			// Extra safety check:
			// only chats that are still guest-owned can be transferred.
			if (chat.getUser() == null && guestSessionId.equals(chat.getGuestSessionId())) {

				chat.setUser(user);
				chat.setGuestSessionId(null);
				chat.setUpdatedAt(LocalDateTime.now());

				chatRepository.save(chat);
				transferredCount++;
			}
		}

		return transferredCount;
	}

	private User getCurrentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			throw new IllegalArgumentException("User is not authenticated.");
		}

		if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
			String provider = OAuth2UserUtil.getProvider(oauthToken);
			String oauthId = OAuth2UserUtil.getOauthId(oauthToken);

			return userRepository.findByOauthProviderAndOauthId(provider, oauthId)
					.orElseThrow(() -> new IllegalArgumentException("User not found."));
		}

		String email = authentication.getName();

		return userRepository.findByEmailIgnoreCaseAndOauthProvider(email, "local")
				.orElseThrow(() -> new IllegalArgumentException("User not found."));
	}

	private void validateGuestSessionId(String guestSessionId) {
		if (guestSessionId == null || guestSessionId.isBlank()) {
			throw new IllegalArgumentException("Guest session ID is required.");
		}
	}
}