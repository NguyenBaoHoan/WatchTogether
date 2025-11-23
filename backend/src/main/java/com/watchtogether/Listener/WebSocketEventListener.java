package com.watchtogether.Listener; 

import com.watchtogether.DTO.ChatMessageDTO;
import com.watchtogether.Entity.jpa.ChatMessage.MessageType;
import com.watchtogether.Service.RoomPresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;
    private final RoomPresenceService roomPresenceService;

    // Hàm này tự động chạy khi User tắt tab / mất mạng / F5
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        
        // Lấy thông tin user từ session (đã lưu lúc join)
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        String roomId = (String) headerAccessor.getSessionAttributes().get("room_id");

        if (username != null && roomId != null) {
            log.info("🔴 USER DISCONNECTED: {} from Room: {}", username, roomId);

            // 1. Xóa khỏi Redis & Giảm DB
            roomPresenceService.removeUser(roomId, username);

            // 2. Báo cho mọi người là user này đã thoát
            ChatMessageDTO chatMessage = new ChatMessageDTO();
            chatMessage.setType(MessageType.LEAVE);
            chatMessage.setSender(username);
            messagingTemplate.convertAndSend("/topic/room/" + roomId, chatMessage);

            // 3. Gửi danh sách thành viên mới (đã trừ người này ra)
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/members", roomPresenceService.getOnlineUsers(roomId));
        }
    }
}