package com.watchtogether.Service;

import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.watchtogether.DTO.Request.VideoEventDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoSyncService {
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast video event tới tất cả clients trong phòng
     * 
     * @param roomId ID của phòng
     * @param event  Video event (play/pause/seek/change)
     */
    public void broadcastVideoEvent(String roomId, VideoEventDto event) {
        String destination = "/topic/rooms/" + roomId + "/video";

        log.info("Broadcasting video event to {}: type = {} , time = {}",
                destination, event.getType(), event.getCurrentTime());

        // send events to topic, all subcribers in this room will receive this event
        messagingTemplate.convertAndSend(destination, event);

    }
}
