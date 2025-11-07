package com.watchtogether.DTO.Response;

import com.watchtogether.Entity.jpa.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResAuth {
    
    // Chỉ trả về Access Token cho client
    private String accessToken; 
    
    // Trả về thông tin user (trừ mật khẩu)
    private UserInfo user;

    // Lớp con để chứa thông tin user an toàn
    @Data
    @Builder
    public static class UserInfo {
        private String id;
        private String name;
        private String email;

        public static UserInfo fromUser(User user) {
            return UserInfo.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
        }
    }
}