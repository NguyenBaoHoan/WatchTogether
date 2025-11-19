package com.watchtogether.Entity.jpa;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    @Column(columnDefinition = "TEXT")
    private String content;

    // --- THAY ĐỔI QUAN TRỌNG ---
    // Thay vì lưu String sender, ta lưu User object
    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender; 
    
    // Giữ lại field này để backup nếu là Guest chưa login,
    // hoặc dùng để hiển thị nhanh mà không cần join bảng User
    @Column(name = "sender_name")
    private String senderName; 

    // Thay vì String roomId, ta lưu Room object
    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    private LocalDateTime timestamp;

    public enum MessageType { CHAT, JOIN, LEAVE }
}