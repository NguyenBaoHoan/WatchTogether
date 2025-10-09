package com.watchtogether.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.watchtogether.DTO.Request.VideoEventDto;
import com.watchtogether.DTO.Response.ErrorResponse;
import com.watchtogether.Service.VideoSyncService;
import com.watchtogether.Service.RoomService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class VideoSyncController {

    private final VideoSyncService videoSyncService;
    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Nhận video event từ client và broadcast tới room
     * Endpoint: /app/rooms/{roomId}/video
     * 
     * Flow:
     * 1. Client gửi event (play/pause/seek/change)
     * 2. Server validate roomId và participant
     * 3. Broadcast tới tất cả clients trong phòng
     * 4. Clients nhận và sync player state
     */
    @MessageMapping("/rooms/{roomId}/video")
    public void handleVideoEvent(
            @DestinationVariable String roomId,
            @Payload VideoEventDto event,
            SimpMessageHeaderAccessor headerAccessor) {

        try {
            // 1. Get participant info from session
            String participantId = (String) headerAccessor.getSessionAttributes().get("participantId");
            String sessionRoomId = (String) headerAccessor.getSessionAttributes().get("roomId");

            if (participantId == null || !roomId.equals(sessionRoomId)) {
                log.warn("Invalid session or mismatched room for participant event");
                return;
            }

            // 2. Validate room exists
            if (!roomService.roomExists(roomId)) {
                log.warn("Video event sent to non-existent room: {}", roomId);
                sendErrorToClient(headerAccessor, "Room not found");
                return;
            }

            // 3. Validate event data
            if (event.getType() == null) {
                log.warn("Video event without type from participant: {} in room: {}", participantId, roomId);
                sendErrorToClient(headerAccessor, "Event type is required");
                return;
            }

            // 4. Set metadata
            event.setParticipantId(participantId);
            event.setRoomId(roomId);
            event.setTimestamp(System.currentTimeMillis());

            log.info("Processing video event: type={}, roomId={}, from={}, time={}",
                    event.getType(), roomId, participantId, event.getCurrentTime());

            // 5. Broadcast to all participants in room
            videoSyncService.broadcastVideoEvent(roomId, event);

        } catch (Exception e) {
            log.error("Error handling video event in room {}: {}", roomId, e.getMessage(), e);
            sendErrorToClient(headerAccessor, "Internal server error");
        }
    }

    /**
     * Send error message back to specific client
     */
    private void sendErrorToClient(SimpMessageHeaderAccessor headerAccessor, String errorMessage) {
        String sessionId = headerAccessor.getSessionId();
        if (sessionId != null) {
            messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "/queue/errors",
                    new ErrorResponse(errorMessage, System.currentTimeMillis()));
        }
    }

    
}
