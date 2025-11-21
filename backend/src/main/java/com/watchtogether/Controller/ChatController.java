package com.watchtogether.Controller;

import com.watchtogether.DTO.ChatMessageDTO;
import com.watchtogether.Entity.jpa.ChatMessage;
import com.watchtogether.Entity.jpa.Room;
import com.watchtogether.Entity.jpa.User;
import com.watchtogether.Repository.jpa.ChatRepository;
import com.watchtogether.Repository.jpa.RoomRepository;
import com.watchtogether.Repository.jpa.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Controller

public class ChatController {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    private ChatRepository chatRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public ChatController(ChatRepository chatRepository, RoomRepository roomRepository, UserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    // 1. WebSocket: Nhận tin nhắn -> Lưu DB -> Gửi cho mọi người
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDTO dto) {
        // prepare data
        LocalDateTime now = LocalDateTime.now();
        dto.setTimestamp(now);

        ChatMessage entity = new ChatMessage();
        entity.setType(dto.getType());
        entity.setContent(dto.getContent());
        entity.setTimestamp(LocalDateTime.now());
        entity.setSenderName(dto.getSender()); // Lưu tên hiển thị

        // 1. Tìm Room từ DB
        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));
        entity.setRoom(room);

        // 2. Tìm User từ DB (Dựa vào tên hoặc logic Auth của bạn)
        // LƯU Ý: Nếu app cho phép Guest (không cần login), bước này sẽ khó.
        // Nếu Guest: sender trong DB sẽ là null, chỉ có senderName.
        // 3. Tìm User (nếu có)
        Optional<User> userOpt = userRepository.findByName(dto.getSender());
        userOpt.ifPresent(entity::setSender);

        // 3. Lưu vào DB
        String destination = "/topic/room/" + dto.getRoomId() + "/chat";
        messagingTemplate.convertAndSend(destination, dto);
    }

    // 2. REST API: Lấy lịch sử chat khi mới vào phòng
    // Client sẽ gọi: GET /api/v1/chat/history?roomId=XYZ
    @GetMapping("/api/v1/chat/history")
    @ResponseBody // Trả về JSON
    public List<ChatMessageDTO> getChatHistory(@RequestParam String roomId) {
        // Lấy Entity từ DB -> Convert sang DTO -> Trả về
        return chatRepository.findByRoomRoomIdOrderByTimestampAsc(roomId)
                .stream()
                .map(msg -> {
                    ChatMessageDTO dto = new ChatMessageDTO();
                    dto.setType(msg.getType());
                    dto.setContent(msg.getContent());
                    dto.setSender(msg.getSenderName()); // Lấy tên backup
                    dto.setRoomId(msg.getRoom().getRoomId());
                    dto.setTimestamp(msg.getTimestamp());
                    return dto;
                })
                .toList();
    }
}