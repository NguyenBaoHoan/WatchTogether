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
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

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
        // Tạo cookie HttpOnly
        ResponseCookie cookie = ResponseCookie.from("WT_ACCESS_TOKEN", response.getAccessToken())
                .httpOnly(true)
                .secure(false) // dev: false, production: true (HTTPS)
                .path("/")
                .maxAge(86400) // hoặc thời gian phù hợp
                .sameSite("Lax") // ⭐ Vì dùng proxy, FE/BE cùng origin → dùng Lax
                .build();

        // Trả về response cho client với HTTP status 201 Created (Tạo thành công).
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    // (Sau này bạn sẽ thêm các API khác ở đây, ví dụ: join room)

    @PostMapping("/{roomId}/join")
    public ResponseEntity<ResJoinRoom> joinRoom(
            @PathVariable String roomId,
            @RequestBody(required = false) ReqJoinRoom request,
            @CookieValue(value = "WT_ACCESS_TOKEN", required = false) String existingToken) {
        
        // 🔍 Debug log
        System.out.println("🍪 Received cookie: " + (existingToken != null ? "YES (length=" + existingToken.length() + ")" : "NO"));
        
        // Truyền existingToken vào service để kiểm tra duplicate
        ResJoinRoom response = roomService.joinRoom(roomId, request, existingToken);

        // Tạo cookie HttpOnly cho access token
        ResponseCookie cookie = ResponseCookie.from("WT_ACCESS_TOKEN", response.getAccessToken())
                .httpOnly(true)
                .secure(false) // dev: false, production: true (HTTPS)
                .path("/")
                .maxAge(86400) // 24 giờ
                .sameSite("Lax") // ⭐ Vì dùng proxy, FE/BE cùng origin → dùng Lax
                .build();

        return ResponseEntity
                .ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @GetMapping("/{roomId}/participants")
    public ResponseEntity<List<ResParticipant>> getParticipants(@PathVariable String roomId) {
        return ResponseEntity.ok(roomService.getParticipants(roomId));
    }
}
