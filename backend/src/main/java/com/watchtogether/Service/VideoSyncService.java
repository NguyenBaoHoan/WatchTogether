package com.watchtogether.Service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.watchtogether.DTO.Request.VideoEventDto;
import com.watchtogether.Entity.redis.Room;
import com.watchtogether.util.Enum.VideoEventType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoSyncService {
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomService roomService;

    /**
     * Broadcast video event tới tất cả clients trong phòng
     * và lưu state vào Redis để sync cho user mới join
     * 
     * @param roomId ID của phòng
     * @param event  Video event (play/pause/seek/change)
     */
    public void broadcastVideoEvent(String roomId, VideoEventDto event) {
        String destination = "/topic/rooms/" + roomId + "/video";

        log.info("Broadcasting video event to {}: type = {}, time = {}, url = {}", 
                destination, event.getType(), event.getCurrentTime(), event.getVideoUrl());

        // 1. Update room state in Redis
        updateRoomVideoState(roomId, event);

        // 2. Broadcast to all subscribers in this room
        messagingTemplate.convertAndSend(destination, event);
    }

    /**
     * Update video state trong Redis Room
     */
    private void updateRoomVideoState(String roomId, VideoEventDto event) {
        try {
            Room room = roomService.getRoom(roomId);
            if (room == null) {
                log.warn("Cannot update video state: Room {} not found", roomId);
                return;
            }

            // Update room state dựa trên event type
            switch (event.getType()) {
                case PLAY:
                    room.setPlaybackState("PLAYING");
                    if (event.getCurrentTime() != null) {
                        room.setLastPosition(event.getCurrentTime());
                    }
                    break;

                case PAUSE:
                    room.setPlaybackState("PAUSED");
                    if (event.getCurrentTime() != null) {
                        room.setLastPosition(event.getCurrentTime());
                    }
                    break;

                case SEEK:
                    if (event.getCurrentTime() != null) {
                        room.setLastPosition(event.getCurrentTime());
                    }
                    break;

                case CHANGE:
                    if (event.getVideoUrl() != null) {
                        room.setCurrentVideoUrl(event.getVideoUrl());
                        room.setLastPosition(0.0);
                        room.setPlaybackState("PAUSED");
                    }
                    break;
            }

            room.setLastSyncAt(java.time.Instant.now());
            roomService.saveRoom(room);

            log.debug("Updated room {} video state: {} at position {}", 
                    roomId, room.getPlaybackState(), room.getLastPosition());

        } catch (Exception e) {
            log.error("Error updating room video state for room {}: {}", roomId, e.getMessage(), e);
        }
    }

    /**
     * Send current video state to specific user (khi mới join)
     */
    public void sendCurrentStateToUser(String roomId, String sessionId) {
        try {
            Room room = roomService.getRoom(roomId);
            if (room == null) {
                log.warn("Cannot send state: Room {} not found", roomId);
                return;
            }

            // Tạo SYNC_STATE event với current state
            VideoEventDto syncEvent = VideoEventDto.builder()
                    .type(VideoEventType.SYNC_STATE)
                    .videoUrl(room.getCurrentVideoUrl())
                    .currentTime(room.getLastPosition())
                    .roomId(roomId)
                    .timestamp(System.currentTimeMillis())
                    .build();

            // Thêm playback state
            syncEvent.setPlaybackState(room.getPlaybackState());

            log.info("Sending current state to user {}: url={}, time={}, state={}", 
                    sessionId, room.getCurrentVideoUrl(), room.getLastPosition(), room.getPlaybackState());

            // Send tới specific user session
            messagingTemplate.convertAndSendToUser(
                    sessionId, 
                    "/queue/video/sync", 
                    syncEvent
            );

        } catch (Exception e) {
            log.error("Error sending current state to user {} in room {}: {}", 
                    sessionId, roomId, e.getMessage(), e);
        }
    }
}
