package com.watchtogether.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Tắt CSRF (Cross-Site Request Forgery) vì chúng ta dùng JWT, không dùng
                // session cookie.
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        // Cho phép mọi người truy cập API tạo và tham gia phòng mà không cần đăng nhập.
                        .requestMatchers("/api/rooms/**").permitAll()
                        .anyRequest().authenticated())

                // Cấu hình không tạo session, vì mỗi request sẽ gửi kèm JWT (stateless).
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }
}