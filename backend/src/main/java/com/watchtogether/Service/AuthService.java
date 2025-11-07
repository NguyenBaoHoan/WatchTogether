package com.watchtogether.Service;

import com.watchtogether.Entity.jpa.User;
import com.watchtogether.Repository.jpa.UserRepository;
import com.watchtogether.DTO.Request.ReqAuth;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Đăng ký người dùng mới
     */
    public User register(ReqAuth request) throws Exception {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new Exception("Email is already taken");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // ⭐ Mã hóa mật khẩu
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    /**
     * Đăng nhập người dùng
     */
    public User login(ReqAuth request) throws Exception {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new Exception("Invalid email or password"));

        // ⭐ Kiểm tra mật khẩu đã mã hóa
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new Exception("Invalid email or password");
        }
        
        return user;
    }
}