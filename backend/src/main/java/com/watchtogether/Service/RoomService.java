package com.watchtogether.Service;

import com.watchtogether.Repository.jpa.ParticipantRepository;
import com.watchtogether.Repository.redis.RoomRedisRepository;
import com.watchtogether.DTO.Request.ReqCreateRoom;
import com.watchtogether.DTO.Request.ReqJoinRoom;
import com.watchtogether.DTO.Response.ResCreateRoom;
import com.watchtogether.DTO.Response.ResJoinRoom;
import com.watchtogether.DTO.Response.ResParticipant;
import com.watchtogether.Entity.jpa.Participant;
import com.watchtogether.Entity.redis.Room;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class RoomService {

        private final RoomRedisRepository roomRedisRepository; // Dùng để tương tác với Redis
        private final ParticipantRepository participantRepository; // Dùng để tương tác với postgreSQL
        private final JwtService jwtService;
        private final RoomEventPublisher eventPublisher;

        private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        private static final SecureRandom RANDOM = new SecureRandom();

        @Transactional // Đảm bảo các thao tác với MySQL (lưu Participant) là an toàn.
        public ResCreateRoom createRoom(ReqCreateRoom request) {
                // --- BƯỚC 1: TẠO DỮ LIỆU PHÒNG VÀ LƯU VÀO REDIS ---
                String roomId = UUID.randomUUID().toString();
                String inviteCode = generateInviteCode(6);

                Room newRoom = Room.builder()
                                .id(roomId)
                                .inviteCode(inviteCode)
                                .playbackState("PAUSED")
                                .lastPosition(0.0)
                                .createdAt(Instant.now())
                                .lastSyncAt(Instant.now())
                                .timeToLive(86400L) // Set phòng tự hủy sau 24 giờ
                                .build();
                roomRedisRepository.save(newRoom); // Thao tác này sẽ lưu object vào Redis.

                // --- BƯỚC 2: TẠO DỮ LIỆU HOST VÀ LƯU VÀO MYSQL ---
                String hostId = UUID.randomUUID().toString();
                String hostDisplayName = (request != null && request.getDisplayName() != null
                                && !request.getDisplayName().isEmpty())
                                                ? request.getDisplayName()
                                                : "Host";
                Participant host = Participant.builder()
                                .id(hostId)
                                .roomId(roomId)
                                .displayName(hostDisplayName)
                                .role("HOST")
                                .joinedAt(Instant.now())
                                .build();
                participantRepository.save(host); // Thao tác này sẽ lưu object vào MySQL.

                // --- BƯỚC 3: TẠO TOKEN VÀ CHUẨN BỊ RESPONSE ---
                String accessToken = jwtService.generateToken(host);

                String joinUrl = "http://localhost:5173/room/" + roomId; // dev
                String wsUrl = "http://localhost:8080/ws"; // SockJS http(s)

                return ResCreateRoom.builder()
                                .roomId(roomId)
                                .inviteCode(inviteCode)
                                .accessToken(accessToken)
                                .wsUrl(wsUrl)
                                .joinUrl(joinUrl)
                                .build();
        }

        // Hàm tiện ích để tạo mã mời ngẫu nhiên
        private String generateInviteCode(int length) {
                return IntStream.range(0, length)
                                .map(i -> RANDOM.nextInt(CHARS.length()))
                                .mapToObj(randomIndex -> String.valueOf(CHARS.charAt(randomIndex)))
                                .collect(Collectors.joining());
        }

        @Transactional
        public ResJoinRoom joinRoom(String roomId, ReqJoinRoom request) {
                // verify room exists in Redis and validate invite code
                String participantId = UUID.randomUUID().toString();
                String displayName = (request != null && request.getDisplayName() != null
                                && !request.getDisplayName().isEmpty())
                                                ? request.getDisplayName()
                                                : "Guest";
                Participant guest = Participant.builder()
                                .id(participantId)
                                .roomId(roomId)
                                .displayName(displayName)
                                .role("GUEST")
                                .joinedAt(Instant.now())
                                .build();
                participantRepository.save(guest);

                ResParticipant p = ResParticipant.builder()
                                .id(guest.getId())
                                .displayName(guest.getDisplayName())
                                .role(guest.getRole())
                                .joinedAt(guest.getJoinedAt())
                                .isOnline(true)
                                .build();
                eventPublisher.participantJoined(roomId, p);

                String accessToken = jwtService.generateToken(guest);

                // Trả về URL SockJS (http) để FE kết nối qua SockJS
                String wsUrl = "http://localhost:8080/ws";
                return ResJoinRoom.builder()
                                .roomId(roomId)
                                .accessToken(accessToken)
                                .wsUrl(wsUrl)
                                .build();
        }

        /**
         * Check if room exists in Redis
         * @param roomId the room ID to check
         * @return true if room exists, false otherwise
         */
        public boolean roomExists(String roomId) {
                if (roomId == null || roomId.isEmpty()) {
                        return false;
                }
                return roomRedisRepository.existsById(roomId);
        }

        /**
         * Get room data from Redis
         * @param roomId the room ID
         * @return Room object or null if not found
         */
        public Room getRoom(String roomId) {
                if (roomId == null || roomId.isEmpty()) {
                        return null;
                }
                return roomRedisRepository.findById(roomId).orElse(null);
        }

        /**
         * Save room data to Redis
         * @param room the room object to save
         * @return saved room object
         */
        public Room saveRoom(Room room) {
                if (room == null) {
                        throw new IllegalArgumentException("Room cannot be null");
                }
                return roomRedisRepository.save(room);
        }

        // Sanitize list: remove nulls, distinct by id
        public List<ResParticipant> getParticipants(String roomId) {
                return participantRepository.findByRoomId(roomId).stream()
                                .filter(Objects::nonNull)
                                .map(p -> ResParticipant.builder()
                                                .id(p.getId())
                                                .displayName(p.getDisplayName())
                                                .role(p.getRole())
                                                .joinedAt(p.getJoinedAt())
                                                .isOnline(true)
                                                .build())
                                .filter(rp -> rp.getId() != null && !rp.getId().isEmpty())
                                .collect(Collectors.collectingAndThen(
                                                Collectors.toMap(ResParticipant::getId, Function.identity(),
                                                                (a, b) -> a, LinkedHashMap::new),
                                                m -> new ArrayList<>(m.values())));
        }
}
