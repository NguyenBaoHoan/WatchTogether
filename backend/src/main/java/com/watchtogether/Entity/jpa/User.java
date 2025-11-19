package com.watchtogether.Entity.jpa;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String password;

    // --- SỬA LỖI Ở ĐÂY ---
    @OneToMany(mappedBy = "sender")
    @JsonIgnore // Tránh lỗi vòng lặp khi chuyển sang JSON
    @ToString.Exclude // <--- THÊM DÒNG NÀY: Tránh lỗi LazyInit khi in log/debug
    @EqualsAndHashCode.Exclude // Nên thêm cả cái này để tối ưu hiệu năng
    private List<ChatMessage> messages;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}