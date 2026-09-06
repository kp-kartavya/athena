package com.interview.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.interview.model.Chat;
import com.interview.model.User;

public interface ChatRepository extends JpaRepository<Chat, String> {
	List<Chat> findByUser(User user);
}
