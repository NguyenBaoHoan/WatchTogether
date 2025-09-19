    package com.watchtogether.Entity;

    import jakarta.persistence.Entity;
    import jakarta.persistence.Id;
    import lombok.AllArgsConstructor;
    import lombok.Builder;
    import lombok.Data;
    import lombok.NoArgsConstructor;

    import java.time.Instant;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Entity
    public class Participant {

        @Id // Dùng @Id của Jakarta Persistence (JPA) để xác định đây là khóa chính của bảng.
        private String id;

        private String roomId;
        private String displayName;
        private String role; // HOST / VIEWER
        private Instant joinedAt;
    }
