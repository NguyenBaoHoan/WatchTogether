package com.watchtogether.Repository.jpa;

import com.watchtogether.Entity.jpa.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<ChatMessage, Long> {
    // Tìm theo Room Object -> field roomId
    List<ChatMessage> findByRoomRoomIdOrderByTimestampAsc(String roomId);
}