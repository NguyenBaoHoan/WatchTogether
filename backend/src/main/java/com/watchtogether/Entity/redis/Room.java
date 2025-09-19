package com.watchtogether.Entity.redis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

import java.io.Serializable;
import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("Room") // Đánh dấu lớp này là một đối tượng để lưu vào Redis.
// Mọi object Room sẽ được lưu với key có dạng "Room:<id>"
public class Room implements Serializable { // Implement Serializable để có thể lưu vào Redis

    @Id // Dùng @Id của Spring Data để xác định đây là khóa chính trong Redis.
    private String id;

    private String inviteCode;
    private String videoSource;
    private Double lastPosition;
    private String playbackState;
    private Instant lastSyncAt;
    private Instant createdAt;

    // @TimeToLive: Tính năng đặc biệt của Redis.
    // Đặt thời gian sống cho object này (tính bằng giây).
    // Sau khi hết thời gian, Redis sẽ tự động xóa object này đi.
    @TimeToLive(unit = TimeUnit.SECONDS)
    private Long timeToLive;
}
