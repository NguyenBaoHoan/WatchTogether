package com.watchtogether.Repository.jpa;

import com.watchtogether.Entity.jpa.RoomParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoomParticipantRepository extends JpaRepository<RoomParticipant, Long> {
    // Tìm người tham gia dựa trên Session ID của WebSocket
    Optional<RoomParticipant> findBySessionId(String sessionId);
    
    // Xóa người tham gia dựa trên Session ID
    void deleteBySessionId(String sessionId);
}