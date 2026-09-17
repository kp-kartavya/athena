package com.interview.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * Represents an Athena user account.
 *
 * Supports Google OAuth, GitHub OAuth, and local email/password accounts.
 */
@Data
@Entity
@Table(name = "users")
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false)
	private String email;

	private String oauthProvider;

	@Column(unique = true)
	private String oauthId;

	private String passwordHash;

	private String profileImage;

	@Column(nullable = false)
	private boolean emailVerified = false;

	private LocalDateTime createdAt;

	private LocalDateTime lastLoginAt;

	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Chat> chats = new ArrayList<>();
}