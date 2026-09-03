package com.interview.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.interview.model.Chat;

public interface ChatRepository extends JpaRepository<Chat, String> {

}
