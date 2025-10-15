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
     * Cập nhật trạng thái video trong Redis Room
     * Method này được gọi khi có sự kiện video từ client (play, pause, seek, change
     * video)
     */
    private void updateRoomVideoState(String roomId, VideoEventDto event) {
        try {
            // 1. Lấy thông tin room từ Redis
            Room room = roomService.getRoom(roomId);
            if (room == null) {
                log.warn("Cannot update video state: Room {} not found", roomId);
                return;
            }

            // 2. Cập nhật trạng thái room dựa trên loại sự kiện
            switch (event.getType()) {
                case PLAY:
                    // Khi user nhấn play: đặt trạng thái PLAYING và cập nhật thời gian hiện tại
                    room.setPlaybackState("PLAYING");
                    if (event.getCurrentTime() != null) {
                        room.setLastPosition(event.getCurrentTime());
                    }
                    break;

                case PAUSE:
                    // Khi user nhấn pause: đặt trạng thái PAUSED và lưu thời gian dừng
                    room.setPlaybackState("PAUSED");
                    if (event.getCurrentTime() != null) {
                        room.setLastPosition(event.getCurrentTime());
                    }
                    break;

                case SEEK:
                    // Khi user tua video: chỉ cập nhật thời gian hiện tại, không đổi trạng thái
                    // play/pause
                    if (event.getCurrentTime() != null) {
                        room.setLastPosition(event.getCurrentTime());
                    }
                    break;

                case CHANGE:
                    // Khi user chuyển video mới: đặt URL mới, reset thời gian về 0, và pause
                    if (event.getVideoUrl() != null) {
                        room.setCurrentVideoUrl(event.getVideoUrl());
                        room.setLastPosition(0.0); // Reset về đầu video
                        room.setPlaybackState("PAUSED"); // Pause để user có thể chuẩn bị
                    }
                    break;
            }

            // 3. Cập nhật thời gian đồng bộ cuối cùng và lưu vào Redis
            room.setLastSyncAt(java.time.Instant.now());
            roomService.saveRoom(room);

            // 4. Log để debug
            log.debug("Updated room {} video state: {} at position {}",
                    roomId, room.getPlaybackState(), room.getLastPosition());

        } catch (Exception e) {
            // Xử lý lỗi nếu có vấn đề khi cập nhật
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

            // Thêm playback state vào syncEvent để khi user mới join vào phòng, họ sẽ nhận được trạng thái phát video hiện tại (PAUSED/PLAYING)
            syncEvent.setPlaybackState(room.getPlaybackState());

            log.info("Sending current state to user {}: url={}, time={}, state={}",
                    sessionId, room.getCurrentVideoUrl(), room.getLastPosition(), room.getPlaybackState());

            // Send tới specific user session
            messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "/queue/video/sync",
                    syncEvent);

        } catch (Exception e) {
            log.error("Error sending current state to user {} in room {}: {}",
                    sessionId, roomId, e.getMessage(), e);
        }
    }
}
