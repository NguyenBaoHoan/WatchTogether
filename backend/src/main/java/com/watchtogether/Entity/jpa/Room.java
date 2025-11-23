package com.watchtogether.Entity.jpa;

import lombok.*;
import jakarta.persistence.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;

@Data
@Entity
@Table(name = "rooms")
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    @Id
    private String roomId; // input Frontend will create this ID

    // Tên phòng do người dùng đặt
    @Column(name = "room_name")
    private String roomName;

    // Quan hệ với chủ phòng
    @ManyToOne
    @JoinColumn(name = "host_id")
    private User host;

    private int currPlayer = 0;
    private String currentVideoId = "M7lc1UVf-VE";
    private boolean isPlaying = false;
    @Column(name = "online_count")
    private Integer onlineCount = 0;
    @Column(name = "current_time_value")
    private double currentTime = 0.0;

    // Thay thế List<String> users bằng bảng liên kết RoomParticipant
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<RoomParticipant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ChatMessage> chatMessages = new ArrayList<>();

    public Room(String roomId) {
        this.roomId = roomId;
    }

    // --- THÊM LẠI QUEUE ĐỂ KHÔNG BỊ LỖI CODE CŨ ---
    // Dùng @Transient để chỉ lưu trên RAM, không lưu DB (tránh lỗi Mapping
    // Exception)
    @Transient
    private List<VideoItem> queue = new ArrayList<>();

    public void addParticipant(RoomParticipant participant) {
        participants.add(participant);
        participant.setRoom(this);
    }

    public void removeParticipant(RoomParticipant participant) {
        participants.remove(participant);
        participant.setRoom(null);
    }

    public String getHostName() {
        return host != null ? host.getName() : null;
    }

}