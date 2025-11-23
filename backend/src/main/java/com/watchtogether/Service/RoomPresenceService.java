package com.watchtogether.Service;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.watchtogether.Repository.jpa.RoomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoomPresenceService {
    private final RoomRepository roomRepository;
    private final RedisTemplate<String, String> redisTemplate;

    // Key chuẩn: room:{id}:users
    private String getRoomKey(String roomId) {
        return "room:" + roomId + ":users";
    }

    public void addUser(String roomId, String username) {
        String key = getRoomKey(roomId);
        // add to redis
        Long added = redisTemplate.opsForSet().add(key, username);
        if (added != null && added > 0) {
            roomRepository.incrementOnlineCount(roomId);
        }
        redisTemplate.expire(key, 24, TimeUnit.HOURS);
    }

    public void removeUser(String roomId, String username) {
        String key = getRoomKey(roomId);
        Long removed = redisTemplate.opsForSet().remove(key, username);
        // Chỉ giảm DB nếu xóa thành công
        if (removed != null && removed > 0) {
            roomRepository.decrementOnlineCount(roomId);
        }
    }

    public Set<String> getOnlineUsers(String roomId) {
        Set<String> members = redisTemplate.opsForSet().members(getRoomKey(roomId));
        return members != null ? members : Collections.emptySet();
    }
}
