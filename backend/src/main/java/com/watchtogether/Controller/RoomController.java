package com.watchtogether.Controller;

import com.watchtogether.Service.RoomService;
import com.watchtogether.DTO.Request.ReqCreateRoom;
import com.watchtogether.DTO.Response.ResCreateRoom;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
