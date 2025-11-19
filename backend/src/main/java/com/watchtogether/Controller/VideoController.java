package com.watchtogether.Controller;

import com.watchtogether.DTO.RoomDTO;
import com.watchtogether.DTO.VideoAction;
import com.watchtogether.Entity.jpa.Room;
import com.watchtogether.Service.RoomServiceJPA;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
public class VideoController {

    @Autowired
    private RoomServiceJPA roomService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Client gửi: /app/room/{roomId}/join
    @MessageMapping("/room/{roomId}/join")
    @SendTo("/topic/room/{roomId}")
    // SỬA LỖI TẠI ĐÂY: Thêm ("roomId") vào @DestinationVariable
    public RoomDTO joinRoom(@DestinationVariable("roomId") String roomId, 
                            @Payload String username,
                            SimpMessageHeaderAccessor headerAccessor) {
        
        log.info("REQUEST JOIN ROOM | RoomId: {} | User: {}", roomId, username);
        String sessionId = headerAccessor.getSessionId();
        
        // Lấy Room Entity từ Service
        Room room = roomService.joinRoom(roomId, username, sessionId);

        // --- LOG KIỂM TRA HOSTNAME ---
        String hostName = (room.getHost() != null) ? room.getHost().getName() : "NULL";
        log.info("DEBUG HOST INFO | Room: {} | Host Object: {} | HostName: {}", 
                 room.getRoomId(), 
                 (room.getHost() != null ? "EXIST" : "NULL"), 
                 hostName);
        // -----------------------------

        // Convert sang DTO để đảm bảo Frontend nhận được field hostName
        // và tránh lỗi vòng lặp vô tận của Jackson
        return RoomDTO.fromEntity(room);
    }

    // Client gửi: /app/video/action (Play/Pause/Seek)
    @MessageMapping("/video/action")
    public void handleVideoAction(@Payload VideoAction action) {
        log.debug("VIDEO ACTION RECEIVED | Room: {} | Action: {} | Time: {}",
                action.getRoomId(), action.getType(), action.getTimestamp());
        if (action.getVideoId() == null || action.getVideoId().isEmpty()) {
            // WARN: Cảnh báo những thứ bất thường nhưng không làm sập app
            log.warn("INVALID ACTION | Missing VideoId | User: {}", action.getUsername());
            return;
        }
        // 1. Cho phép ASK_SYNC đi qua mà không cần check videoId quá gắt
        if ("ASK_SYNC".equals(action.getType())) {
            String roomId = action.getRoomId();
            // Chỉ cần broadcast để Host nghe thấy
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/video", action);
            return;
        }
        String roomId = action.getRoomId();

        // Cập nhật trạng thái server
        boolean isPlaying = "PLAY".equals(action.getType());
        roomService.updateVideoState(roomId, action.getVideoId(), action.getTimestamp(), isPlaying);

        // Gửi lại cho tất cả mọi người trong phòng
        // Tương đương socket.in(room).emit(...)
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/video", action);
    }

    // Client gửi lệnh Sync (khi người mới vào hoặc bấm nút Sync)
    @MessageMapping("/video/sync")
    public void handleSync(@Payload VideoAction action) {
        // Broadcast trạng thái hiện tại cho tất cả
        log.info("SYNC REQUEST | User: {} | Action: {}", action.getUsername(), action.getType());
        messagingTemplate.convertAndSend("/topic/room/" + action.getRoomId() + "/sync", action);
    }
}