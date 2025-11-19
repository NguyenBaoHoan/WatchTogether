package com.watchtogether.Repository.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import com.watchtogether.Entity.jpa.Room;


public interface RoomRepository  extends JpaRepository<Room, String> {
     // Kiểm tra xem User (Host) đã có phòng nào tên này chưa
    boolean existsByHost_NameAndRoomName(String hostName, String roomName);
}
