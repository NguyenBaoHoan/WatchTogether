package com.watchtogether.Controller;

import com.watchtogether.Entity.jpa.Room;
import com.watchtogether.Entity.jpa.User;
import com.watchtogether.Repository.jpa.UserRepository;
import com.watchtogether.Service.AuthService;
import com.watchtogether.Service.RoomServiceJPA;
import lombok.Data;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomControllerJPA {

    @Autowired
    private RoomServiceJPA roomService;
    private final UserRepository userRepository;

    public RoomControllerJPA(RoomServiceJPA roomService, UserRepository userRepository) {
        this.roomService = roomService;
        this.userRepository = userRepository;
    }

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

    @GetMapping("/history")
    public ResponseEntity<?> getRoomHistory() {
        // Lấy User ID từ Security Context (Token)
        String email = AuthService.getCurrentUserLogin().orElse(null);
        if (email == null)
            return ResponseEntity.status(401).build();

        User user = userRepository.findByEmail(email).orElseThrow();

        List<Room> rooms = roomService.getRoomHistory(user.getId());
        return ResponseEntity.ok(rooms);
    }
}