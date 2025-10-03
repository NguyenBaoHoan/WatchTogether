package com.watchtogether.Controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import com.watchtogether.DTO.Request.VideoEventDto;
import com.watchtogether.Service.VideoSyncService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class VideoSyncController {

    private final VideoSyncService videoSyncService;

    /**
     * Nhận video event từ client (thường là Host)
     * Endpoint: /app/rooms/{roomId}/video
     * 
     * Flow:
     * 1. Host gửi event (play/pause/seek)
     * 2. Server nhận và validate
     * 3. Broadcast tới tất cả clients trong phòng
     * 4. Guests nhận và sync player
     */

    @MessageMapping("/room/{roomId}/video")
    public void handleVideoEvent(
            @DestinationVariable String roomId,
            @Payload VideoEventDto event,
            SimpMessageHeaderAccessor headerAccessor) {
        // get participantId from websocket session
        String participantId = (String) headerAccessor.getSessionAttributes().get("participantId");

        log.info("Received video event: type = {}, roomId = {}, from = {}",
                event.getType(), roomId, participantId);

        // set participantId into event to guests to know who send the event
        event.setParticipantId(participantId);
        event.setTimestamp(System.currentTimeMillis());

        videoSyncService.broadcastVideoEvent(roomId, event);
    }
}
