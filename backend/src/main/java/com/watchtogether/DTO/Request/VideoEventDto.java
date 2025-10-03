package com.watchtogether.DTO.Request;

import com.watchtogether.util.Enum.VideoEventType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class VideoEventDto {
    // Loai event: PLAY, PAUSE, SEEK, CHANGE
    private VideoEventType type;
    //id of person who send the event
    private String participantId;
    // time of the event
    private Double currentTime;
    // url of the video when it is changed
    private String url;
    private Long timestamp;
}
