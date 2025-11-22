package com.watchtogether.Service;

import com.watchtogether.Entity.jpa.Room;
import com.watchtogether.Entity.jpa.RoomParticipant;
import com.watchtogether.Entity.jpa.User;
import com.watchtogether.Entity.jpa.VideoItem;
import com.watchtogether.Repository.jpa.RoomParticipantRepository;
import com.watchtogether.Repository.jpa.RoomRepository;
import com.watchtogether.Repository.jpa.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@Transactional // Quan trọng: Đảm bảo các thao tác DB đồng bộ
public class RoomServiceJPA {

    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoomParticipantRepository participantRepository;

    // --- LOGIC TẠO PHÒNG MỚI ---
    public Room createRoom(String roomName, String username) {
        // 1. Kiểm tra User có tồn tại không
        User host = userRepository.findByName(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // 2. Kiểm tra xem User này đã tạo phòng tên này chưa
        if (roomRepository.existsByHost_NameAndRoomName(username, roomName)) {
            throw new RuntimeException("Bạn đã có một phòng tên '" + roomName + "' rồi. Vui lòng chọn tên khác!");
        }

        // 3. Tạo phòng mới với ID tự sinh (UUID)
        Room room = new Room();
        room.setRoomId(UUID.randomUUID().toString()); // Tự động sinh ID không trùng
        room.setRoomName(roomName);
        room.setHost(host);

        // Các giá trị mặc định
        room.setCurrentVideoId("M7lc1UVf-VE");
        room.setPlaying(false);

        log.info("ROOM CREATED | ID: {} | Name: {} | Host: {}", room.getRoomId(), roomName, username);
        return roomRepository.save(room);
    }

    // --- XỬ LÝ LOGIC JOIN ROOM VỚI DATABASE ---
    public Room joinRoom(String roomId, String username, String sessionId) {
        // 1. Tìm Room trong DB, nếu chưa có thì tạo mới
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));

        // 2. Tìm User trong DB. Nếu là Guest (chưa có), tự động tạo User tạm
        User user = userRepository.findByName(username).orElseGet(() -> {
            User newUser = User.builder()
                    .name(username)
                    .email(username + "@guest.com") // Tạo email giả để thỏa mãn Unique constraint
                    .password("guest_pass") // Password giả
                    .build();
            return userRepository.save(newUser);
        });

        RoomParticipant.Role role = RoomParticipant.Role.GUEST;
        // Nếu phòng chưa có host -> Người đầu tiên vào là Host
        if (room.getHost() == null) {
            room.setHost(user);
            role = RoomParticipant.Role.HOST;
        }
        // Nếu người vào chính là Host đã được set từ trước (lúc createRoom)
        else if (room.getHost().getId().equals(user.getId())) {
            role = RoomParticipant.Role.HOST;
        }

        // 4. Thêm vào danh sách tham gia (xử lý duplicate tab)
        boolean alreadyInRoom = room.getParticipants().stream()
                .anyMatch(p -> p.getUser().getId().equals(user.getId()));

        if (!alreadyInRoom) {
            RoomParticipant participant = new RoomParticipant();
            participant.setUser(user);
            participant.setRoom(room);
            participant.setSessionId(sessionId);
            participant.setRole(role); // Set Role đã xác định ở trên

            room.addParticipant(participant);
        } else {
            // Update session ID và Role (đề phòng trường hợp F5)
            RoomParticipant.Role finalRole = role;
            room.getParticipants().stream()
                    .filter(p -> p.getUser().getId().equals(user.getId()))
                    .findFirst()
                    .ifPresent(p -> {
                        p.setSessionId(sessionId);
                        p.setRole(finalRole); // Cập nhật lại role cho chắc chắn
                    });
        }

        log.info("USER JOINED | Room: {} | User: {} | Role: {}", roomId, username, role);
        return roomRepository.save(room);
    }

    // --- XỬ LÝ LOGIC UPDATE VIDEO ---
    public void updateVideoState(String roomId, String videoId, double time, boolean isPlaying) {
        Room room = roomRepository.findById(roomId).orElse(null);

        if (room == null) {
            log.error("SYNC ERROR | Room not found: {}", roomId);
            return;
        }

        // Log kiểm tra độ lệch pha
        log.debug("STATE UPDATE | Room: {} | Time: {} -> {} | Playing: {} -> {}",
                roomId, room.getCurrentTime(), time, room.isPlaying(), isPlaying);

        if (videoId != null && !videoId.equals(room.getCurrentVideoId())) {
            log.info("VIDEO CHANGED | Room: {} | New Video: {}", roomId, videoId);
            room.setCurrentVideoId(videoId);
        }

        room.setCurrentTime(time);
        room.setPlaying(isPlaying);

        // Lưu trạng thái mới xuống DB
        roomRepository.save(room);
    }

    // --- XỬ LÝ QUEUE (RAM ONLY - VÌ @TRANSIENT) ---
    public void addToQueue(String roomId, VideoItem item) {
        Room room = roomRepository.findById(roomId).orElse(null);
        if (room != null) {
            // Vì field queue trong Entity Room đang để @Transient,
            // nó sẽ hoạt động như một List trên RAM, không lưu xuống DB.
            // Điều này giúp code cũ chạy được mà không bị lỗi Mapping.
            room.getQueue().add(item);
            log.info("ADDED TO QUEUE (RAM) | Room: {} | Video: {}", roomId, item.getTitle());
        }
    }

    // --- XỬ LÝ NGẮT KẾT NỐI ---
    public Room handleDisconnect(String sessionId) {
        // 1. Tìm xem SessionId này thuộc về Participant nào
        Optional<RoomParticipant> participantOpt = participantRepository.findBySessionId(sessionId);

        if (participantOpt.isPresent()) {
            RoomParticipant participant = participantOpt.get();
            Room room = participant.getRoom();
            User user = participant.getUser();

            // 2. Xóa Participant khỏi phòng
            room.getParticipants().remove(participant);
            participantRepository.delete(participant); // Xóa khỏi bảng phụ

            log.info("USER LEFT | Room: {} | User: {}", room.getRoomId(), user.getName());

            // 3. Xử lý chuyển quyền Host nếu Host rời phòng
            if (room.getHost() != null && room.getHost().getId().equals(user.getId())) {
                log.info("HOST DISCONNECTED | Assigning new host...");
                room.setHost(null); // Xóa host cũ

                // Chọn người kế tiếp làm host (nếu còn ai đó)
                if (!room.getParticipants().isEmpty()) {
                    RoomParticipant newHostPart = room.getParticipants().get(0);
                    room.setHost(newHostPart.getUser());
                    newHostPart.setRole(RoomParticipant.Role.HOST);
                    log.info("NEW HOST AUTO-ASSIGNED: {}", newHostPart.getUser().getName());
                } else {
                    log.info("ROOM EMPTY | Room: {}", room.getRoomId());
                    // Tùy chọn: roomRepository.delete(room); // Xóa phòng nếu không còn ai
                }
            }

            return roomRepository.save(room);
        }
        return null;
    }

    public Room getRoom(String roomId) {
        return roomRepository.findById(roomId).orElse(null);
    }
     public List<Room> getRoomHistory(String userId) {
        return roomRepository.findHistoryByUserId(userId);
    }
}