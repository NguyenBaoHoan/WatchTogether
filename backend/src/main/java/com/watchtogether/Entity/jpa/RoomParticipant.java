package com.watchtogether.Entity.jpa;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "room_participants")
public class RoomParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "room_id")
    @JsonIgnore
    private Room room;

    // THÊM TRƯỜNG NÀY ĐỂ QUẢN LÝ KẾT NỐI
    private String sessionId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private Role role; // HOST, GUEST

    private LocalDateTime joinedAt = LocalDateTime.now();

    public enum Role {
        HOST, GUEST
    }
}