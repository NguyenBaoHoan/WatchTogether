package com.watchtogether.DTO.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
public class ResJoinRoom {
    private String roomId;
    private String accessToken;
    private String wsUrl;
}
