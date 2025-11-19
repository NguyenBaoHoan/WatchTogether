package com.watchtogether.DTO;

import com.watchtogether.Entity.jpa.Room;
import lombok.Data;

@Data
public class RoomDTO {
    private String roomId;
    private String roomName;
    private String hostName; // Frontend sẽ đọc field này
    private String currentVideoId;
    private double currentTime;
    private boolean isPlaying;

    // Hàm chuyển đổi từ Entity sang DTO
    public static RoomDTO fromEntity(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setRoomId(room.getRoomId());
        dto.setRoomName(room.getRoomName());
        
        // Xử lý null safe cho hostName
        if (room.getHost() != null) {
            dto.setHostName(room.getHost().getName());
        } else {
            dto.setHostName(null);
        }

        dto.setCurrentVideoId(room.getCurrentVideoId());
        dto.setCurrentTime(room.getCurrentTime());
        dto.setPlaying(room.isPlaying());
        return dto;
    }
}