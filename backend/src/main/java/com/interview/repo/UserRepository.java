package com.interview.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.interview.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByOauthProviderAndOauthId(String oauthProvider, String oauthId);

	Optional<User> findByEmailIgnoreCaseAndOauthProvider(String email, String oauthProvider);

	List<User> findAllByEmailIgnoreCase(String email);
}