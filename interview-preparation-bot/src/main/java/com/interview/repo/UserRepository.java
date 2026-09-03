package com.interview.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.interview.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);

	Optional<User> findByOauthProviderAndOauthId(String oauthProvider, String oauthId);

	boolean existsByEmail(String email);
}