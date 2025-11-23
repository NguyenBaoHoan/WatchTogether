package com.watchtogether.Controller;

import com.watchtogether.DTO.ChatMessageDTO;
import com.watchtogether.Entity.jpa.ChatMessage.MessageType;
import com.watchtogether.Service.RoomPresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j

public class ParticipantWebSocket {

    private final SimpMessageSendingOperations messagingTemplate;
    private final RoomPresenceService roomPresenceService;

    @MessageMapping("/room/{roomId}/register")
    public void joinRoom(@DestinationVariable String roomId, @Payload String username,
            SimpMessageHeaderAccessor headerAccessor) {
        log.info("PARTICIPANT REGISTER | Room: {} | User: {}", roomId, username);

        // 1. Lưu session
        headerAccessor.getSessionAttributes().put("username", username);
        headerAccessor.getSessionAttributes().put("room_id", roomId);

        roomPresenceService.addUser(roomId, username);

        // 3. Gửi thông báo JOIN
        ChatMessageDTO joinMsg = new ChatMessageDTO();
        joinMsg.setType(MessageType.JOIN);
        joinMsg.setSender(username);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, joinMsg);

        // 4. [QUAN TRỌNG] Gửi danh sách thành viên mới nhất cho cả phòng
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/members",
                roomPresenceService.getOnlineUsers(roomId));
    }
}