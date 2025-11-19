package com.watchtogether.Controller;

import com.watchtogether.Entity.jpa.Room;
import com.watchtogether.Service.RoomServiceJPA;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomControllerJPA {

    @Autowired
    private RoomServiceJPA roomService;

    // DTO nhận dữ liệu tạo phòng
    @Data
    public static class CreateRoomRequest {
        private String roomName;
        private String username;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@RequestBody CreateRoomRequest request) {
        try {
            Room newRoom = roomService.createRoom(request.getRoomName(), request.getUsername());
            // Trả về RoomID để Frontend điều hướng
            return ResponseEntity.ok(newRoom);
        } catch (RuntimeException e) {
            // Trả về lỗi nếu trùng tên hoặc lỗi khác
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}