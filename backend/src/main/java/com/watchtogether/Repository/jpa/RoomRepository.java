package com.watchtogether.Repository.jpa;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.watchtogether.Entity.jpa.Room;

import jakarta.transaction.Transactional;


public interface RoomRepository  extends JpaRepository<Room, String> {
     // Kiểm tra xem User (Host) đã có phòng nào tên này chưa
    boolean existsByHost_NameAndRoomName(String hostName, String roomName);
     // Tìm các phòng mà user là Host hoặc là Participant
    @Query("SELECT DISTINCT r FROM Room r " +
           "LEFT JOIN r.participants p " +
           "WHERE r.host.id = :userId OR p.user.id = :userId " +
           "ORDER BY r.roomId DESC") // Hoặc order by created_at nếu có
    List<Room> findHistoryByUserId(@Param("userId") String userId);

    @Modifying
    @Transactional
    @Query("UPDATE Room r SET r.onlineCount = r.onlineCount + 1 WHERE r.roomId = :roomId")
    void incrementOnlineCount(@Param("roomId") String roomId);

    @Modifying
    @Transactional
    @Query("UPDATE Room r SET r.onlineCount = r.onlineCount - 1 WHERE r.roomId = :roomId AND r.onlineCount > 0")
    void decrementOnlineCount(@Param("roomId") String roomId);
    
    // Reset tất cả về 0 khi khởi động lại server (Optional)
    @Modifying
    @Transactional
    @Query("UPDATE Room r SET r.onlineCount = 0")
    void resetAllOnlineCounts();
}
