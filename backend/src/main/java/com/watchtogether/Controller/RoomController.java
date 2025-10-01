package com.watchtogether.Controller;

import com.watchtogether.Service.RoomService;
import com.watchtogether.DTO.Request.ReqCreateRoom;
import com.watchtogether.DTO.Request.ReqJoinRoom;
import com.watchtogether.DTO.Response.ResCreateRoom;
import com.watchtogether.DTO.Response.ResJoinRoom;
import com.watchtogether.DTO.Response.ResParticipant;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/rooms") // Mọi request đến /api/rooms sẽ được xử lý bởi Controller này.
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    // Xử lý request POST đến /api/rooms để tạo một phòng mới.
    @PostMapping
    public ResponseEntity<ResCreateRoom> createRoom(@RequestBody(required = false) ReqCreateRoom request) {
        // Gọi service để thực hiện logic tạo phòng
        ResCreateRoom response = roomService.createRoom(request);
        // Trả về response cho client với HTTP status 201 Created (Tạo thành công).
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // (Sau này bạn sẽ thêm các API khác ở đây, ví dụ: join room)

    @PostMapping("/{roomId}/join")
    public ResponseEntity<ResJoinRoom> joinRoom(@PathVariable String roomId,
            @RequestBody(required = false) ReqJoinRoom request) {
        return ResponseEntity.ok(roomService.joinRoom(roomId, request));
    }

    @GetMapping("/{roomId}/participants")
    public ResponseEntity<List<ResParticipant>> getParticipants(@PathVariable String roomId) {
        return ResponseEntity.ok(roomService.getParticipants(roomId));
    }

}
